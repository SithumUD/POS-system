package com.sithumud.pos_backend.inventory.dto;

import com.sithumud.pos_backend.inventory.entity.TransferStatus;
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
public class StockTransferSearchFilter {

    private String fromBranchSlug;
    private String toBranchSlug;
    private TransferStatus status;
}
