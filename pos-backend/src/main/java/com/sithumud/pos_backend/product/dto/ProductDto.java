package com.sithumud.pos_backend.product.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.sithumud.pos_backend.product.entity.Product;
import com.sithumud.pos_backend.product.entity.UnitOfMeasure;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductDto {

    private UUID id;
    private String sku;
    private String barcode;
    private String name;
    private CategoryDto category;
    private BigDecimal price; // Selling price (mapped from unitPrice)
    private BigDecimal cost;  // Cost price (mapped from costPrice)
    private BigDecimal taxRate;
    private Integer threshold; // Low stock threshold (mapped from reorderThreshold)
    private UnitOfMeasure unitOfMeasure;
    private String unit; // Unit label (e.g. Bottle, Pack, Kg)
    private String imageUrl;
    private UUID supplierId;
    private String supplier; // Preferred supplier name
    private boolean active;
    private Integer totalQuantity;
    private List<BranchStockDto> branchStock;
    private Instant updatedAt;
    private Instant createdAt;

    public static ProductDto fromEntity(Product product, Integer totalQuantity, List<BranchStockDto> branchStock) {
        if (product == null) {
            return null;
        }
        return ProductDto.builder()
                .id(product.getId())
                .sku(product.getSku())
                .barcode(product.getBarcode())
                .name(product.getName())
                .category(CategoryDto.fromEntity(product.getCategory()))
                .price(product.getUnitPrice())
                .cost(product.getCostPrice())
                .taxRate(product.getTaxRate())
                .threshold(product.getReorderThreshold())
                .unitOfMeasure(product.getUnitOfMeasure())
                .unit(product.getUnitLabel())
                .imageUrl(product.getImageUrl())
                .supplierId(product.getPreferredSupplier() != null ? product.getPreferredSupplier().getId() : null)
                .supplier(product.getPreferredSupplier() != null ? product.getPreferredSupplier().getName() : null)
                .active(product.isActive())
                .totalQuantity(totalQuantity != null ? totalQuantity : 0)
                .branchStock(branchStock)
                .updatedAt(product.getUpdatedAt())
                .createdAt(product.getCreatedAt())
                .build();
    }
}
