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
public class CategoryBreakdownDto {

    private UUID categoryId;
    private String categoryName;
    private BigDecimal revenue;
    private long totalUnitsSold;
    private BigDecimal percentageOfTotal;
}
