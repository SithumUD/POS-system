package com.sithumud.pos_backend.superadmin.dto;

import com.sithumud.pos_backend.tenant.entity.PlanType;
import com.sithumud.pos_backend.tenant.entity.Tenant;
import com.sithumud.pos_backend.tenant.entity.TenantStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class TenantSummaryDto {
    private UUID id;
    private String name;
    private String contactEmail;
    private String businessPhone;
    private String businessAddress;
    private PlanType plan;
    private TenantStatus status;
    private int maxUsers;
    private int maxBranches;
    private int maxProducts;
    private Instant createdAt;

    public static TenantSummaryDto fromEntity(Tenant t) {
        return TenantSummaryDto.builder()
                .id(t.getId())
                .name(t.getName() != null ? t.getName() : "")
                .contactEmail(t.getContactEmail())
                .businessPhone(t.getBusinessPhone())
                .businessAddress(t.getBusinessAddress())
                .plan(t.getPlan())
                .status(t.getStatus())
                .maxUsers(t.getMaxUsers())
                .maxBranches(t.getMaxBranches())
                .maxProducts(t.getMaxProducts())
                .createdAt(t.getCreatedAt())
                .build();
    }
}
