package com.sithumud.pos_backend.purchasing.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReceivePurchaseOrderRequest {

    /** Map of productId -> receivedQuantity */
    @NotEmpty(message = "Received items list/map cannot be empty")
    private Map<UUID, Integer> itemQuantities;

    private String notes;
}
