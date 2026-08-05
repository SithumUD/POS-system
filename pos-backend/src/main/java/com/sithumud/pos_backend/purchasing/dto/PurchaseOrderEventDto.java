package com.sithumud.pos_backend.purchasing.dto;

import com.sithumud.pos_backend.purchasing.entity.PurchaseOrderEvent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderEventDto {

    private UUID id;
    private String description;
    private Instant occurredAt;
    private String actorName;

    public static PurchaseOrderEventDto fromEntity(PurchaseOrderEvent event) {
        if (event == null) {
            return null;
        }
        return PurchaseOrderEventDto.builder()
                .id(event.getId())
                .description(event.getDescription())
                .occurredAt(event.getOccurredAt())
                .actorName(event.getActor() != null ? event.getActor().getName() : "System")
                .build();
    }
}
