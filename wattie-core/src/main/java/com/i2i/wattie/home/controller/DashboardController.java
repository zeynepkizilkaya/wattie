package com.i2i.wattie.home.controller;

import com.i2i.wattie.home.dto.DashboardSummaryResponse;
import com.i2i.wattie.home.service.HomeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Dashboard controller providing aggregated platform-wide metrics
 * for the frontend's top stats bar (total energy, total cost, penalties, anomalies).
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard")
public class DashboardController {

    private final HomeService homeService;

    @GetMapping("/summary")
    @Operation(summary = "Get aggregated platform-wide dashboard metrics")
    public ResponseEntity<DashboardSummaryResponse> getSummary() {
        return ResponseEntity.ok(homeService.getDashboardSummary());
    }
}
