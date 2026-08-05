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
public class RevenueSeriesPointDto {

    private String periodLabel; // e.g. "2026-08-05" or "14:00"
    private BigDecimal revenue;
    private long transactionCount;
}
