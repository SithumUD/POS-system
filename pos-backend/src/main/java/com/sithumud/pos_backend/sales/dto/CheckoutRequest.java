package com.sithumud.pos_backend.sales.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutRequest {

    /** Client-side generated UUID for zero double-charging idempotency */
    @NotBlank(message = "Idempotency key is required")
    private String idempotencyKey;

    @NotBlank(message = "Branch slug is required")
    private String branchSlug;

    private String terminalId;

    @NotEmpty(message = "Checkout items cannot be empty")
    @Valid
    private List<CheckoutItemRequest> items;

    @PositiveOrZero(message = "Discount cannot be negative")
    @Builder.Default
    private BigDecimal discount = BigDecimal.ZERO;

    @PositiveOrZero(message = "Tax cannot be negative")
    @Builder.Default
    private BigDecimal tax = BigDecimal.ZERO;

    @NotEmpty(message = "Payment tenders cannot be empty")
    @Valid
    private List<PaymentTenderDto> payments;

    private String note;

    /** Optional offline timestamp for offline sync requests */
    private Instant offlineSoldAt;
}
