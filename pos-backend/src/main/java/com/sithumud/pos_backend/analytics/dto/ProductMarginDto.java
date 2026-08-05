package com.sithumud.pos_backend.analytics.dto;

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
public class ProductMarginDto {

    private UUID productId;
    private String name;
    private String sku;
    private BigDecimal costPrice;
    private BigDecimal sellingPrice;
    private BigDecimal unitMarginAmount;
    private BigDecimal marginPercentage;
    private long totalUnitsSold;
    private BigDecimal totalRevenue;
}
