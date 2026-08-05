package com.sithumud.pos_backend.inventory.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateStockTransferRequest {

    @NotBlank(message = "Source branch slug (fromBranch) is required")
    private String fromBranchSlug;

    @NotBlank(message = "Destination branch slug (toBranch) is required")
    private String toBranchSlug;

    @NotEmpty(message = "Transfer items list cannot be empty")
    @Valid
    private List<StockTransferItemRequest> items;

    private String note;
}
