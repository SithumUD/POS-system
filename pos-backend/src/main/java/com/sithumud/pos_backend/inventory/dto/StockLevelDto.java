package com.sithumud.pos_backend.inventory.dto;

import com.sithumud.pos_backend.inventory.entity.Inventory;
import com.sithumud.pos_backend.product.dto.StockStatus;
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
public class StockLevelDto {

    private UUID id;
    private UUID productId;
    private String productName;
    private String sku;
    private String barcode;
    private String categoryName;
    private String branchSlug;
    private String branchName;
    private Integer quantityOnHand;
    private Integer reorderPoint;
    private StockStatus stockStatus;

    public static StockLevelDto fromEntity(Inventory inventory) {
        if (inventory == null) {
            return null;
        }

        Integer qty = inventory.getQuantityOnHand() != null ? inventory.getQuantityOnHand() : 0;
        Integer threshold = (inventory.getProduct() != null && inventory.getProduct().getReorderThreshold() != null)
                ? inventory.getProduct().getReorderThreshold() : 10;

        StockStatus status;
        if (qty <= 0) {
            status = StockStatus.OUT_OF_STOCK;
        } else if (qty <= threshold) {
            status = StockStatus.LOW_STOCK;
        } else {
            status = StockStatus.IN_STOCK;
        }

        return StockLevelDto.builder()
                .id(inventory.getId())
                .productId(inventory.getProduct() != null ? inventory.getProduct().getId() : null)
                .productName(inventory.getProduct() != null ? inventory.getProduct().getName() : null)
                .sku(inventory.getProduct() != null ? inventory.getProduct().getSku() : null)
                .barcode(inventory.getProduct() != null ? inventory.getProduct().getBarcode() : null)
                .categoryName(inventory.getProduct() != null && inventory.getProduct().getCategory() != null
                        ? inventory.getProduct().getCategory().getName() : null)
                .branchSlug(inventory.getBranch() != null ? inventory.getBranch().getSlug() : null)
                .branchName(inventory.getBranch() != null ? inventory.getBranch().getName() : null)
                .quantityOnHand(qty)
                .reorderPoint(threshold)
                .stockStatus(status)
                .build();
    }
}
