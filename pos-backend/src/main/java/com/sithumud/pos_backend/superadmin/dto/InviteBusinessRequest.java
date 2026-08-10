package com.sithumud.pos_backend.superadmin.dto;

import com.sithumud.pos_backend.tenant.entity.PlanType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InviteBusinessRequest {

    @Email(message = "Valid business email is required")
    @NotBlank(message = "Business email is required")
    private String email;

    @NotNull(message = "Plan type is required")
    private PlanType plan;
}
