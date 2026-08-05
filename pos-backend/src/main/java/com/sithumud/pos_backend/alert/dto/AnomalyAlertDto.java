package com.sithumud.pos_backend.alert.dto;

import com.sithumud.pos_backend.alert.entity.AlertSeverity;
import com.sithumud.pos_backend.alert.entity.AlertStatus;
import com.sithumud.pos_backend.alert.entity.AlertType;
import com.sithumud.pos_backend.alert.entity.AnomalyAlert;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnomalyAlertDto {

    private UUID id;
    private AlertType type;
    private AlertSeverity severity;
    private AlertStatus status;
    private String title;
    private String description;
    private String branchSlug;
    private String branchName;
    private Instant detectedAt;
    private List<String> investigationNotes;

    public static AnomalyAlertDto fromEntity(AnomalyAlert alert) {
        if (alert == null) return null;

        return AnomalyAlertDto.builder()
                .id(alert.getId())
                .type(alert.getType())
                .severity(alert.getSeverity())
                .status(alert.getStatus())
                .title(alert.getTitle())
                .description(alert.getDescription())
                .branchSlug(alert.getBranch() != null ? alert.getBranch().getSlug() : null)
                .branchName(alert.getBranch() != null ? alert.getBranch().getName() : null)
                .detectedAt(alert.getDetectedAt())
                .investigationNotes(alert.getInvestigationNotes())
                .build();
    }
}
