package com.i2i.wattie.home.service;

import com.i2i.wattie.home.dto.*;
import com.i2i.wattie.home.entity.Appliance;
import com.i2i.wattie.home.entity.Home;
import com.i2i.wattie.home.repository.ApplianceRepository;
import com.i2i.wattie.home.repository.ConsumptionSnapshotRepository;
import com.i2i.wattie.home.repository.EventLogRepository;
import com.i2i.wattie.home.repository.HomeRepository;
import com.i2i.wattie.tariff.model.ApplianceBreachState;
import com.i2i.wattie.telemetry.dto.HomeRegisteredEvent;
import com.i2i.wattie.telemetry.model.HomeState;
import com.i2i.wattie.telemetry.service.IgniteStateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.ignite.client.ClientCache;
import org.apache.ignite.client.IgniteClient;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

import static com.i2i.wattie.common.config.KafkaTopicConfig.REGISTRATION_TOPIC;

@Slf4j
@Service
@RequiredArgsConstructor
public class HomeService {

    private static final String BREACH_CACHE_NAME = "applianceBreachStates";

    private final HomeRepository homeRepository;
    private final ApplianceRepository applianceRepository;
    private final ConsumptionSnapshotRepository consumptionSnapshotRepository;
    private final EventLogRepository eventLogRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final IgniteStateService igniteStateService;
    private final IgniteClient igniteClient;

    @Transactional
    public HomeResponse registerHome(HomeRegistrationRequest request) {
        Home home = new Home();
        home.setName(request.getName());
        home.setAddress(request.getAddress());
        home.setContactEmail(request.getContactEmail());
        home.setPowerQuotaKwh(request.getPowerQuotaKwh());
        home.setFinancialQuota(request.getFinancialQuota());
        home.setNormalTariffRate(request.getNormalTariffRate());
        home.setPenaltyTariffRate(request.getPenaltyTariffRate());

        Home savedHome = homeRepository.save(home);

        List<Appliance> savedAppliances = request.getAppliances().stream()
                .map(applianceRequest -> {
                    Appliance appliance = new Appliance();
                    appliance.setHome(savedHome);
                    appliance.setName(applianceRequest.getName());
                    appliance.setType(applianceRequest.getType());
                    appliance.setSafeLimitWatts(applianceRequest.getSafeLimitWatts());
                    return applianceRepository.save(appliance);
                })
                .toList();

        publishRegistrationEvent(savedHome, savedAppliances);
        igniteStateService.initializeHomeState(savedHome.getId());

        HomeResponse response = new HomeResponse();
        response.setId(savedHome.getId());
        response.setName(savedHome.getName());
        response.setMessage("Home registered successfully");
        return response;
    }

    /**
     * Enhanced home status: includes quota percentages and anomaly count
     * for frontend progress bars and visual indicators.
     */
    public HomeStatusResponse getHomeStatus(Long homeId) {
        HomeState state = igniteStateService.getHomeState(homeId);
        if (state == null) {
            throw new IllegalArgumentException("No live state found for home id: " + homeId);
        }

        Home home = homeRepository.findById(homeId)
                .orElseThrow(() -> new IllegalArgumentException("Home not found with id: " + homeId));

        // Calculate quota percentages
        BigDecimal powerPercent = BigDecimal.ZERO;
        BigDecimal costPercent = BigDecimal.ZERO;

        if (home.getPowerQuotaKwh() != null && home.getPowerQuotaKwh().compareTo(BigDecimal.ZERO) > 0) {
            powerPercent = state.getTotalKwh()
                    .divide(home.getPowerQuotaKwh(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }
        if (home.getFinancialQuota() != null && home.getFinancialQuota().compareTo(BigDecimal.ZERO) > 0) {
            costPercent = state.getTotalCost()
                    .divide(home.getFinancialQuota(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        // Count anomalous appliances for this home
        int anomalyCount = countAnomalousAppliances(homeId);

        return HomeStatusResponse.builder()
                .homeId(state.getHomeId())
                .homeName(home.getName())
                .totalKwh(state.getTotalKwh())
                .totalCost(state.getTotalCost())
                .penaltyActive(state.isPenaltyActive())
                .powerQuotaKwh(home.getPowerQuotaKwh())
                .financialQuota(home.getFinancialQuota())
                .powerQuotaPercent(powerPercent)
                .costQuotaPercent(costPercent)
                .anomalousApplianceCount(anomalyCount)
                .build();
    }

    /**
     * Returns appliances combined with their live anomaly state from Ignite.
     * This is the key missing endpoint for the frontend to visually differentiate
     * anomalous appliances with red glow / lightning effects.
     */
    public List<ApplianceStatusResponse> getApplianceStatuses(Long homeId) {
        List<Appliance> appliances = applianceRepository.findByHomeId(homeId);
        ClientCache<Long, ApplianceBreachState> breachCache = getBreachCache();

        return appliances.stream()
                .map(appliance -> {
                    ApplianceBreachState breachState = null;
                    try {
                        breachState = breachCache.get(appliance.getId());
                    } catch (Exception e) {
                        log.warn("Failed to fetch breach state for appliance {}: {}", appliance.getId(), e.getMessage());
                    }

                    return ApplianceStatusResponse.builder()
                            .id(appliance.getId())
                            .homeId(homeId)
                            .name(appliance.getName())
                            .type(appliance.getType())
                            .safeLimitWatts(appliance.getSafeLimitWatts())
                            .createdAt(appliance.getCreatedAt())
                            .consecutiveBreaches(breachState != null ? breachState.getConsecutiveBreaches() : 0)
                            .anomalyFlagged(breachState != null && breachState.isAnomalyFlagged())
                            .build();
                })
                .toList();
    }

    /**
     * Aggregated dashboard summary across all homes for the frontend top stats bar.
     */
    public DashboardSummaryResponse getDashboardSummary() {
        List<Home> allHomes = homeRepository.findAll();

        BigDecimal totalEnergy = BigDecimal.ZERO;
        BigDecimal totalCost = BigDecimal.ZERO;
        int penaltyCount = 0;
        int anomalyHomeCount = 0;
        int totalAnomalousAppliances = 0;

        for (Home home : allHomes) {
            try {
                HomeState state = igniteStateService.getHomeState(home.getId());
                if (state != null) {
                    totalEnergy = totalEnergy.add(state.getTotalKwh());
                    totalCost = totalCost.add(state.getTotalCost());
                    if (state.isPenaltyActive()) {
                        penaltyCount++;
                    }
                }

                int anomalyCount = countAnomalousAppliances(home.getId());
                if (anomalyCount > 0) {
                    anomalyHomeCount++;
                    totalAnomalousAppliances += anomalyCount;
                }
            } catch (Exception e) {
                log.warn("Failed to fetch state for home {}: {}", home.getId(), e.getMessage());
            }
        }

        return DashboardSummaryResponse.builder()
                .totalHomes(allHomes.size())
                .totalEnergyKwh(totalEnergy)
                .totalCost(totalCost)
                .homesWithPenalty(penaltyCount)
                .homesWithAnomaly(anomalyHomeCount)
                .totalAnomalousAppliances(totalAnomalousAppliances)
                .build();
    }

    private void publishRegistrationEvent(Home home, List<Appliance> appliances) {
        List<HomeRegisteredEvent.ApplianceInfo> applianceInfos = appliances.stream()
                .map(a -> new HomeRegisteredEvent.ApplianceInfo(
                        a.getId(), a.getName(), a.getType(), a.getSafeLimitWatts()))
                .collect(Collectors.toList());

        HomeRegisteredEvent event = new HomeRegisteredEvent(home.getId(), home.getName(), applianceInfos);
        kafkaTemplate.send(REGISTRATION_TOPIC, home.getId().toString(), event);
    }

    public List<Home> getAllHomes() {
        return homeRepository.findAll();
    }

    public List<Appliance> getHomeAppliances(Long homeId) {
        return applianceRepository.findByHomeId(homeId);
    }

    @Transactional
    public Appliance addApplianceToHome(Long homeId, ApplianceRequest request) {
        Home home = homeRepository.findById(homeId)
                .orElseThrow(() -> new IllegalArgumentException("Home not found with id: " + homeId));

        Appliance appliance = new Appliance();
        appliance.setHome(home);
        appliance.setName(request.getName());
        appliance.setType(request.getType());
        appliance.setSafeLimitWatts(request.getSafeLimitWatts());

        Appliance savedAppliance = applianceRepository.save(appliance);
        publishRegistrationEvent(home, List.of(savedAppliance));
        return savedAppliance;
    }

    public List<com.i2i.wattie.home.entity.EventLog> getHomeEvents(Long homeId) {
        return eventLogRepository.findByHomeIdOrderByCreatedAtDesc(homeId);
    }

    public List<ConsumptionTrendResponse> getConsumptionTrend(Long homeId) {
        return consumptionSnapshotRepository.findByHomeIdOrderBySnapshotDateAsc(homeId)
                .stream()
                .map(snapshot -> {
                    ConsumptionTrendResponse response = new ConsumptionTrendResponse();
                    response.setDate(snapshot.getSnapshotDate());
                    response.setTotalKwh(snapshot.getTotalKwh());
                    response.setTotalCost(snapshot.getTotalCost());
                    return response;
                })
                .toList();
    }

    /**
     * Counts appliances with anomalyFlagged=true in Ignite for a given home.
     */
    private int countAnomalousAppliances(Long homeId) {
        List<Appliance> appliances = applianceRepository.findByHomeId(homeId);
        ClientCache<Long, ApplianceBreachState> breachCache = getBreachCache();
        int count = 0;

        for (Appliance appliance : appliances) {
            try {
                ApplianceBreachState breachState = breachCache.get(appliance.getId());
                if (breachState != null && breachState.isAnomalyFlagged()) {
                    count++;
                }
            } catch (Exception e) {
                // Silently skip — Ignite may not have data for this appliance yet
            }
        }
        return count;
    }

    private ClientCache<Long, ApplianceBreachState> getBreachCache() {
        return igniteClient.getOrCreateCache(BREACH_CACHE_NAME);
    }
}