package com.sithumud.pos_backend.inventory.dto;

import com.sithumud.pos_backend.inventory.entity.StockTransferItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockTransferItemDto {

    private UUID id;
    private UUID productId;
    private String productName;
    private String sku;
    private Integer quantity;

    public static StockTransferItemDto fromEntity(StockTransferItem item) {
        if (item == null) {
            return null;
        }
        return StockTransferItemDto.builder()
                .id(item.getId())
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .productName(item.getProductNameSnapshot())
                .sku(item.getProductSkuSnapshot())
                .quantity(item.getQuantity())
                .build();
    }
}
