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
public class SalesSummaryDto {

    private BigDecimal grossRevenue;
    private BigDecimal totalDiscounts;
    private BigDecimal netRevenue;
    private long totalTransactions;
    private BigDecimal averageBasketValue;
    private long totalItemsSold;
}
