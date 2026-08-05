package com.sithumud.pos_backend.inventory.dto;

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
public class StockSearchFilter {

    private String search; // Product name, SKU, barcode
    private String branchSlug;
    private UUID categoryId;
    private UUID supplierId;
    private StockStatus stockStatus;
}
