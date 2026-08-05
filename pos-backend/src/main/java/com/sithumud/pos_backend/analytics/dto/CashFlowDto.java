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
public class CashFlowDto {

    private BigDecimal cashTotal;
    private BigDecimal cardTotal;
    private BigDecimal splitTotal;
    private BigDecimal totalTendered;
    private BigDecimal totalChangeGiven;
}
