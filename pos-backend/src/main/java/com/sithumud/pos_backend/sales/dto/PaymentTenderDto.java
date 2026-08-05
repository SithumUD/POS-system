package com.sithumud.pos_backend.sales.dto;

import com.sithumud.pos_backend.sales.entity.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
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
public class PaymentTenderDto {

    @NotNull(message = "Payment method is required")
    private PaymentMethod method;

    @NotNull(message = "Payment amount is required")
    @PositiveOrZero(message = "Payment amount must be non-negative")
    private BigDecimal amount;

    @PositiveOrZero(message = "Tendered amount must be non-negative")
    private BigDecimal tenderedAmount;

    private String referenceNumber;
}
