package com.sithumud.pos_backend.purchasing.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
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
public class PurchaseOrderItemRequest {

    @NotNull(message = "Product ID is required")
    private UUID productId;

    @NotNull(message = "Quantity ordered is required")
    @Min(value = 1, message = "Quantity ordered must be at least 1")
    private Integer quantityOrdered;

    @NotNull(message = "Unit cost is required")
    @PositiveOrZero(message = "Unit cost must be non-negative")
    private BigDecimal unitCost;
}
