package com.sithumud.pos_backend.sales.dto;

import jakarta.validation.constraints.NotBlank;
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
public class VoidSaleRequest {

    @NotBlank(message = "Reason for voiding sale is required")
    private String reason;

    private String managerApprovalCode;
}
