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
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HeldSaleRequest {

    @NotBlank(message = "Branch slug is required")
    private String branchSlug;

    private String terminalId;

    @NotBlank(message = "Label is required")
    private String label;

    @NotEmpty(message = "Held cart items cannot be empty")
    @Valid
    private List<HeldSaleItemRequest> items;

    @PositiveOrZero(message = "Discount cannot be negative")
    @Builder.Default
    private BigDecimal discount = BigDecimal.ZERO;
}
