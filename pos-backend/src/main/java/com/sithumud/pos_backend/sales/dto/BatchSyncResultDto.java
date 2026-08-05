package com.sithumud.pos_backend.sales.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatchSyncResultDto {

    private String idempotencyKey;
    private String receiptNumber;
    private String status; // SYNCED, DUPLICATE, ERROR
    private String error;
}
