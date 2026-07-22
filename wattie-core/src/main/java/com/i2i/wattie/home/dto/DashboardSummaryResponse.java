package com.i2i.wattie.home.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Aggregated dashboard summary across all registered homes.
 * Used by the frontend top stats bar for total platform metrics.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryResponse {

    private int totalHomes;
    private BigDecimal totalEnergyKwh;
    private BigDecimal totalCost;
    private int homesWithPenalty;
    private int homesWithAnomaly;
    private int totalAnomalousAppliances;
}
