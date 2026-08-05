package com.sithumud.pos_backend.sales.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefundSaleRequest {

    @NotBlank(message = "Reason for refund is required")
    private String reason;

    @NotNull(message = "Refund amount is required")
    @PositiveOrZero(message = "Refund amount must be non-negative")
    private BigDecimal refundAmount;

    /** Map of productId -> quantity returned for stock restoration */
    private Map<UUID, Integer> itemQuantities;
}
