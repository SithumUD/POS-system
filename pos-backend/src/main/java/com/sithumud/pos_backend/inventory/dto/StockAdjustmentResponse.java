package com.sithumud.pos_backend.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockAdjustmentResponse {

    private UUID id;
    private String referenceId;
    private UUID productId;
    private String productName;
    private String sku;
    private String branchSlug;
    private String action;
    private Integer previousQuantity;
    private Integer adjustedQuantityDelta;
    private Integer newQuantity;
    private String reason;
    private String adjustedBy;
    private Instant adjustedAt;
}
