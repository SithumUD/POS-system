package com.sithumud.pos_backend.sales.dto;

import com.sithumud.pos_backend.sales.entity.SaleItem;
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
public class SaleItemDto {

    private UUID id;
    private UUID productId;
    private String name;
    private String sku;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal discount;
    private BigDecimal lineTotal;

    public static SaleItemDto fromEntity(SaleItem item) {
        if (item == null) {
            return null;
        }
        return SaleItemDto.builder()
                .id(item.getId())
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .name(item.getProductNameSnapshot())
                .sku(item.getProductSkuSnapshot())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPriceAtSale())
                .discount(item.getDiscount())
                .lineTotal(item.getLineTotal())
                .build();
    }
}
