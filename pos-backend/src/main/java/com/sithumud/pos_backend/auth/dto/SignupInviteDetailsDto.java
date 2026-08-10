package com.sithumud.pos_backend.auth.dto;

import com.sithumud.pos_backend.tenant.entity.PlanType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SignupInviteDetailsDto {
    private String contactEmail;
    private PlanType plan;
    private int maxUsers;
    private int maxBranches;
    private int maxProducts;
}
