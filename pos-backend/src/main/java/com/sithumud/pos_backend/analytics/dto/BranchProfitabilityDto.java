package com.sithumud.pos_backend.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BranchProfitabilityDto {

    private String branchSlug;
    private String branchName;
    private BigDecimal grossRevenue;
    private BigDecimal netRevenue;
    private long totalOrders;
    private BigDecimal stockAssetValuation;
}
