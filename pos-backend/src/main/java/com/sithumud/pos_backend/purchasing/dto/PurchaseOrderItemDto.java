package com.sithumud.pos_backend.purchasing.dto;

import com.sithumud.pos_backend.purchasing.entity.PurchaseOrderItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderItemDto {

    private UUID id;
    private UUID productId;
    private String name;
    private String sku;
    private Integer quantityOrdered;
    private Integer quantityReceived;
    private BigDecimal unitCost;
    private BigDecimal lineTotal;

    public static PurchaseOrderItemDto fromEntity(PurchaseOrderItem item) {
        if (item == null) {
            return null;
        }

        BigDecimal unitCost = item.getUnitCost() != null ? item.getUnitCost() : BigDecimal.ZERO;
        Integer ordered = item.getQuantityOrdered() != null ? item.getQuantityOrdered() : 0;
        BigDecimal total = unitCost.multiply(BigDecimal.valueOf(ordered));

        return PurchaseOrderItemDto.builder()
                .id(item.getId())
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .name(item.getProduct() != null ? item.getProduct().getName() : null)
                .sku(item.getProduct() != null ? item.getProduct().getSku() : null)
                .quantityOrdered(ordered)
                .quantityReceived(item.getQuantityReceived() != null ? item.getQuantityReceived() : 0)
                .unitCost(unitCost)
                .lineTotal(total)
                .build();
    }
}
