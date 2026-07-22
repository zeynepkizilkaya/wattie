package com.i2i.wattie.home.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HomeStatusResponse {
    private Long homeId;
    private String homeName;
    private BigDecimal totalKwh;
    private BigDecimal totalCost;
    private boolean penaltyActive;

    // Quota limits from PostgreSQL
    private BigDecimal powerQuotaKwh;
    private BigDecimal financialQuota;

    // Computed quota percentages for frontend progress indicators
    private BigDecimal powerQuotaPercent;
    private BigDecimal costQuotaPercent;

    // Anomaly summary
    private int anomalousApplianceCount;
}