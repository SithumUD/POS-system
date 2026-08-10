package com.sithumud.pos_backend.superadmin.dto;

import com.sithumud.pos_backend.tenant.entity.PlanType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateTenantPlanRequest {

    @NotNull(message = "Plan type is required")
    private PlanType plan;

    @Min(value = 1, message = "Must allow at least 1 branch")
    private Integer maxBranches;

    @Min(value = 1, message = "Must allow at least 1 user")
    private Integer maxUsers;

    @Min(value = 100, message = "Must allow at least 100 products")
    private Integer maxProducts;
}
