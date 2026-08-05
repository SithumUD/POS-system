package com.sithumud.pos_backend.alert;

import com.sithumud.pos_backend.alert.dto.AddNoteRequest;
import com.sithumud.pos_backend.alert.dto.AlertSearchFilter;
import com.sithumud.pos_backend.alert.dto.AnomalyAlertDto;
import com.sithumud.pos_backend.alert.dto.ScanSummaryDto;
import com.sithumud.pos_backend.alert.entity.AlertSeverity;
import com.sithumud.pos_backend.alert.entity.AlertStatus;
import com.sithumud.pos_backend.alert.entity.AlertType;
import com.sithumud.pos_backend.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
@Tag(name = "Anomaly Security & Fraud Alerts", description = "Endpoints for fraud detection, real-time heuristic scanning, status lifecycle, and investigation notes")
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get anomaly security alerts", description = "Lists flagged anomaly security alerts (elevated voids, limit-hugging discounts, stock write-offs, zero-stock fast movers).")
    public ResponseEntity<ApiResponse<Page<AnomalyAlertDto>>> getAlerts(
            @RequestParam(required = false) String branchSlug,
            @RequestParam(required = false) AlertSeverity severity,
            @RequestParam(required = false) AlertStatus status,
            @RequestParam(required = false) AlertType type,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "detectedAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        AlertSearchFilter filter = AlertSearchFilter.builder()
                .branchSlug(branchSlug)
                .severity(severity)
                .status(status)
                .type(type)
                .search(search)
                .build();

        Page<AnomalyAlertDto> alerts = alertService.getAlerts(filter, pageable);
        return ResponseEntity.ok(ApiResponse.success(alerts, "Anomaly alerts retrieved successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get anomaly alert by ID", description = "Fetches comprehensive details and investigation notes for a single anomaly alert.")
    public ResponseEntity<ApiResponse<AnomalyAlertDto>> getAlertById(@PathVariable("id") UUID id) {
        AnomalyAlertDto alert = alertService.getAlertById(id);
        return ResponseEntity.ok(ApiResponse.success(alert, "Anomaly alert details retrieved successfully"));
    }

    @PostMapping("/scan")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Run real-time heuristic fraud scan", description = "Triggers real-time heuristic anomaly detection scan against recent sales and movement ledgers.")
    public ResponseEntity<ApiResponse<ScanSummaryDto>> runHeuristicScan() {
        ScanSummaryDto summary = alertService.runHeuristicScan();
        return ResponseEntity.ok(ApiResponse.success(summary, "Heuristic fraud scan completed successfully"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Update alert review status", description = "Updates review status of an anomaly security alert (NEW, INVESTIGATING, REVIEWED, DISMISSED).")
    public ResponseEntity<ApiResponse<AnomalyAlertDto>> updateStatus(
            @PathVariable("id") UUID id,
            @RequestParam("status") AlertStatus status
    ) {
        AnomalyAlertDto alert = alertService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(alert, "Anomaly alert status updated successfully"));
    }

    @PostMapping("/{id}/notes")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Add investigation note", description = "Adds an investigation note to an anomaly alert.")
    public ResponseEntity<ApiResponse<AnomalyAlertDto>> addNote(
            @PathVariable("id") UUID id,
            @Valid @RequestBody AddNoteRequest request
    ) {
        AnomalyAlertDto alert = alertService.addNote(id, request.getNote());
        return ResponseEntity.ok(ApiResponse.success(alert, "Investigation note added successfully"));
    }
}
