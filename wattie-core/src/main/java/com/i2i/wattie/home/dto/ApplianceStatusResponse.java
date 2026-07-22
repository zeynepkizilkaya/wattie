package com.i2i.wattie.home.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Combined appliance info (PostgreSQL) + live anomaly state (Ignite).
 * Used by the frontend to visually differentiate anomalous appliances.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplianceStatusResponse {

    // Static data from PostgreSQL
    private Long id;
    private Long homeId;
    private String name;
    private String type;
    private BigDecimal safeLimitWatts;
    private LocalDateTime createdAt;

    // Live anomaly data from Apache Ignite
    private int consecutiveBreaches;
    private boolean anomalyFlagged;
}
