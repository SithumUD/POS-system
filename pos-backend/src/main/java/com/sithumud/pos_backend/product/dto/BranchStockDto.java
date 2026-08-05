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
public class BranchStockDto {
    private UUID branchId;
    private String branchSlug;
    private String branchName;
    private Integer quantity;
}
