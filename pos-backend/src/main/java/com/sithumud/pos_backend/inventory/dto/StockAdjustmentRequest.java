package com.sithumud.pos_backend.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockAdjustmentRequest {

    @NotNull(message = "Product ID is required")
    private UUID productId;

    @NotBlank(message = "Branch slug is required")
    private String branchSlug;

    /** Adjustment type: ADD, REMOVE, CORRECTION */
    @NotBlank(message = "Adjustment action is required (ADD, REMOVE, CORRECTION)")
    private String action;

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity must be non-negative")
    private Integer quantity;

    @NotBlank(message = "Adjustment reason is required (e.g. Damage, Theft, Spoilage, Recount)")
    private String reason;

    private String note;
}
