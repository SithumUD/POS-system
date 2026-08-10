package com.sithumud.pos_backend.superadmin;

import com.sithumud.pos_backend.common.dto.ApiResponse;
import com.sithumud.pos_backend.superadmin.dto.InviteBusinessRequest;
import com.sithumud.pos_backend.superadmin.dto.TenantSummaryDto;
import com.sithumud.pos_backend.superadmin.dto.UpdateTenantPlanRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/super-admin")
@PreAuthorize("hasRole('SUPER_ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Super Admin", description = "Platform-level endpoints for managing tenants, invitations, and subscription plans")
public class SuperAdminController {

    private final SuperAdminService superAdminService;

    @GetMapping("/tenants")
    @Operation(summary = "List all tenants", description = "Returns all business tenants across all statuses (INVITED, PENDING_APPROVAL, ACTIVE, SUSPENDED).")
    public ResponseEntity<ApiResponse<List<TenantSummaryDto>>> getAllTenants() {
        List<TenantSummaryDto> tenants = superAdminService.getAllTenants();
        return ResponseEntity.ok(ApiResponse.success(tenants, "Tenants retrieved successfully"));
    }

    @PostMapping("/invite")
    @Operation(summary = "Invite a new business", description = "Sends a signup invitation email to a prospective business. Creates a INVITED tenant record with the specified plan.")
    public ResponseEntity<ApiResponse<TenantSummaryDto>> inviteBusiness(
            @Valid @RequestBody InviteBusinessRequest request) {
        TenantSummaryDto tenant = superAdminService.inviteBusiness(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(tenant, "Invitation sent successfully to " + request.getEmail()));
    }

    @PostMapping("/tenants/{id}/approve")
    @Operation(summary = "Approve tenant", description = "Activates a PENDING_APPROVAL tenant and their admin user account. Sends a welcome email to the admin.")
    public ResponseEntity<ApiResponse<TenantSummaryDto>> approveTenant(@PathVariable UUID id) {
        TenantSummaryDto tenant = superAdminService.approveTenant(id);
        return ResponseEntity.ok(ApiResponse.success(tenant, "Tenant approved and activated successfully"));
    }

    @PostMapping("/tenants/{id}/suspend")
    @Operation(summary = "Suspend tenant", description = "Suspends a tenant and all their active user accounts.")
    public ResponseEntity<ApiResponse<TenantSummaryDto>> suspendTenant(@PathVariable UUID id) {
        TenantSummaryDto tenant = superAdminService.suspendTenant(id);
        return ResponseEntity.ok(ApiResponse.success(tenant, "Tenant suspended successfully"));
    }

    @PutMapping("/tenants/{id}/plan")
    @Operation(summary = "Update tenant plan", description = "Changes a tenant's subscription plan and adjusts their resource limits.")
    public ResponseEntity<ApiResponse<TenantSummaryDto>> updateTenantPlan(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTenantPlanRequest request) {
        TenantSummaryDto tenant = superAdminService.updateTenantPlan(id, request);
        return ResponseEntity.ok(ApiResponse.success(tenant, "Tenant plan updated successfully"));
    }
}
