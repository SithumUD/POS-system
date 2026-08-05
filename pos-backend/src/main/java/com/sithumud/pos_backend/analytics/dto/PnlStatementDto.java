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
public class PnlStatementDto {

    private BigDecimal grossSales;
    private BigDecimal discounts;
    private BigDecimal netRevenue;
    private BigDecimal costOfGoodsSold; // COGS
    private BigDecimal grossProfit;
    private BigDecimal grossMarginPercentage;
    private BigDecimal operatingOverhead;
    private BigDecimal netProfit;
}
