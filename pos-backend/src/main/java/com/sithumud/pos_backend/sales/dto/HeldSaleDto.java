package com.sithumud.pos_backend.sales.dto;

import com.sithumud.pos_backend.sales.entity.HeldSale;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HeldSaleDto {

    private UUID id;
    private String label;
    private String branchSlug;
    private String cashierName;
    private String terminalId;
    private BigDecimal discount;
    private Instant heldAt;
    private List<SaleItemDto> items;

    public static HeldSaleDto fromEntity(HeldSale heldSale) {
        if (heldSale == null) {
            return null;
        }

        List<SaleItemDto> itemDtos = (heldSale.getItems() != null) ? heldSale.getItems().stream().map(item -> {
            BigDecimal lineTotal = (item.getUnitPrice() != null && item.getQuantity() != null) ?
                    item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())) : BigDecimal.ZERO;
            return SaleItemDto.builder()
                    .id(item.getId())
                    .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                    .name(item.getProductNameSnapshot())
                    .sku(item.getProductSkuSnapshot())
                    .quantity(item.getQuantity())
                    .unitPrice(item.getUnitPrice())
                    .lineTotal(lineTotal)
                    .build();
        }).collect(Collectors.toList()) : List.of();

        return HeldSaleDto.builder()
                .id(heldSale.getId())
                .label(heldSale.getLabel())
                .branchSlug(heldSale.getBranch() != null ? heldSale.getBranch().getSlug() : null)
                .cashierName(heldSale.getCashier() != null ? heldSale.getCashier().getName() : null)
                .terminalId(heldSale.getTerminalId())
                .discount(heldSale.getDiscount())
                .heldAt(heldSale.getHeldAt())
                .items(itemDtos)
                .build();
    }
}
