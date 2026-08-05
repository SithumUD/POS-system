package com.sithumud.pos_backend.sales.dto;

import jakarta.validation.Valid;
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
public class BatchSyncRequest {

    @NotEmpty(message = "Sales list for batch sync cannot be empty")
    @Valid
    private List<CheckoutRequest> sales;
}
