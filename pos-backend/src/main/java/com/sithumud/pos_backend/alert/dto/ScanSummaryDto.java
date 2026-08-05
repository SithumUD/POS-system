package com.sithumud.pos_backend.alert.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScanSummaryDto {

    private Instant scannedAt;
    private int newAlertsGenerated;
    private List<AnomalyAlertDto> alerts;
}
