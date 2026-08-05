package com.sithumud.pos_backend.purchasing.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdatePurchaseOrderRequest {

    private Instant expectedAt;

    private String notes;

    @NotEmpty(message = "Purchase order items cannot be empty")
    @Valid
    private List<PurchaseOrderItemRequest> items;
}
