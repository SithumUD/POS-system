package com.sithumud.pos_backend.purchasing.dto;

import com.sithumud.pos_backend.purchasing.entity.PurchaseOrderStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatePurchaseOrderRequest {

    @NotNull(message = "Supplier ID is required")
    private UUID supplierId;

    @NotBlank(message = "Branch slug is required")
    private String branchSlug;

    private Instant expectedAt;

    private String notes;

    @NotEmpty(message = "Purchase order items cannot be empty")
    @Valid
    private List<PurchaseOrderItemRequest> items;

    /** Initial status: DRAFT or SENT (default DRAFT) */
    @Builder.Default
    private PurchaseOrderStatus status = PurchaseOrderStatus.DRAFT;
}
