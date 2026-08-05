package com.sithumud.pos_backend.alert.dto;

import com.sithumud.pos_backend.alert.entity.AlertSeverity;
import com.sithumud.pos_backend.alert.entity.AlertStatus;
import com.sithumud.pos_backend.alert.entity.AlertType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertSearchFilter {

    private String branchSlug;
    private AlertSeverity severity;
    private AlertStatus status;
    private AlertType type;
    private String search;
}
