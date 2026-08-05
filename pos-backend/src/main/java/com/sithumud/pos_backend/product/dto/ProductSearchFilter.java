package com.sithumud.pos_backend.product.dto;

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
public class ProductSearchFilter {

    private String search;
    private UUID categoryId;
    private String categorySlug;
    private UUID supplierId;
    private StockStatus stockStatus;
    private String branchSlug;

    @Builder.Default
    private Boolean activeOnly = true;
}
