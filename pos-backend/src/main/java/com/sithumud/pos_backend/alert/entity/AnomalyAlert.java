package com.sithumud.pos_backend.alert.entity;

import com.sithumud.pos_backend.branch.entity.Branch;
import com.sithumud.pos_backend.common.entity.BaseEntity;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "anomaly_alerts")
public class AnomalyAlert extends BaseEntity {

    @Enumerated(EnumType.STRING)
    private AlertType type;

    @Enumerated(EnumType.STRING)
    private AlertSeverity severity;

    @Enumerated(EnumType.STRING)
    private AlertStatus status;

    private String title;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    private Instant detectedAt;

    @ElementCollection(fetch = FetchType.EAGER)
    @Builder.Default
    private List<String> investigationNotes = new ArrayList<>();
}
