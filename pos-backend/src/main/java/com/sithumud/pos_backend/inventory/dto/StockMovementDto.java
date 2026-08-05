package com.sithumud.pos_backend.inventory.dto;

import com.sithumud.pos_backend.inventory.entity.StockMovement;
import com.sithumud.pos_backend.inventory.entity.StockMovementType;
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
public class StockMovementDto {

    private UUID id;
    private UUID productId;
    private String productName;
    private String sku;
    private String branchSlug;
    private String branchName;
    private StockMovementType type;
    private Integer quantity;
    private String referenceId;
    private String note;
    private String createdBy;
    private Instant createdAt;

    public static StockMovementDto fromEntity(StockMovement movement) {
        if (movement == null) {
            return null;
        }
        return StockMovementDto.builder()
                .id(movement.getId())
                .productId(movement.getProduct() != null ? movement.getProduct().getId() : null)
                .productName(movement.getProduct() != null ? movement.getProduct().getName() : null)
                .sku(movement.getProduct() != null ? movement.getProduct().getSku() : null)
                .branchSlug(movement.getBranch() != null ? movement.getBranch().getSlug() : null)
                .branchName(movement.getBranch() != null ? movement.getBranch().getName() : null)
                .type(movement.getType())
                .quantity(movement.getQuantity())
                .referenceId(movement.getReferenceId())
                .note(movement.getNote())
                .createdBy(movement.getCreatedBy() != null ? movement.getCreatedBy().getName() : "System")
                .createdAt(movement.getCreatedAt())
                .build();
    }
}
