package com.sithumud.pos_backend.superadmin;

import com.sithumud.pos_backend.auth.UserRepository;
import com.sithumud.pos_backend.auth.entity.Role;
import com.sithumud.pos_backend.auth.entity.User;
import com.sithumud.pos_backend.auth.entity.UserStatus;
import com.sithumud.pos_backend.common.email.EmailService;
import com.sithumud.pos_backend.common.exception.ApiException;
import com.sithumud.pos_backend.superadmin.dto.InviteBusinessRequest;
import com.sithumud.pos_backend.superadmin.dto.TenantSummaryDto;
import com.sithumud.pos_backend.superadmin.dto.UpdateTenantPlanRequest;
import com.sithumud.pos_backend.tenant.TenantRepository;
import com.sithumud.pos_backend.tenant.context.TenantContext;
import com.sithumud.pos_backend.tenant.entity.PlanType;
import com.sithumud.pos_backend.tenant.entity.Tenant;
import com.sithumud.pos_backend.tenant.entity.TenantStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SuperAdminService {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Transactional(readOnly = true)
    public List<TenantSummaryDto> getAllTenants() {
        return tenantRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(TenantSummaryDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public TenantSummaryDto inviteBusiness(InviteBusinessRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        // Check if already invited / active
        if (tenantRepository.existsByContactEmail(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "EMAIL_ALREADY_INVITED",
                    "A business with this email has already been invited: " + email);
        }

        // Determine plan limits
        int[] limits = planLimits(request.getPlan());

        String signupToken = UUID.randomUUID().toString();
        Tenant tenant = tenantRepository.save(Tenant.builder()
                .name("")  // will be filled during signup
                .contactEmail(email)
                .plan(request.getPlan())
                .status(TenantStatus.INVITED)
                .maxBranches(limits[0])
                .maxUsers(limits[1])
                .maxProducts(limits[2])
                .signupToken(signupToken)
                .signupTokenExpiresAt(Instant.now().plus(72, ChronoUnit.HOURS))
                .build());

        emailService.sendBusinessInvitation(email, signupToken, request.getPlan());
        log.info("Business invitation sent to {} (plan={})", email, request.getPlan());

        return TenantSummaryDto.fromEntity(tenant);
    }

    @Transactional
    public TenantSummaryDto approveTenant(UUID tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "TENANT_NOT_FOUND", "Tenant not found: " + tenantId));

        if (tenant.getStatus() == TenantStatus.ACTIVE) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "ALREADY_ACTIVE", "Tenant is already active.");
        }

        tenant.setStatus(TenantStatus.ACTIVE);
        tenantRepository.save(tenant);

        // Activate the admin user(s) for this tenant
        TenantContext.setTenantId(tenantId);
        try {
            List<User> admins = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.ADMIN && u.getStatus() == UserStatus.SUSPENDED)
                    .collect(Collectors.toList());
            admins.forEach(u -> {
                u.setStatus(UserStatus.ACTIVE);
                userRepository.save(u);
                emailService.sendTenantApprovalNotification(u.getEmail(), u.getName(), tenant.getName());
                log.info("Activated admin user {} for tenant {}", u.getEmail(), tenantId);
            });
        } finally {
            TenantContext.clear();
        }

        log.info("Tenant {} approved and activated.", tenantId);
        return TenantSummaryDto.fromEntity(tenant);
    }

    @Transactional
    public TenantSummaryDto suspendTenant(UUID tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "TENANT_NOT_FOUND", "Tenant not found: " + tenantId));

        tenant.setStatus(TenantStatus.SUSPENDED);
        tenantRepository.save(tenant);

        // Suspend all active users for this tenant
        TenantContext.setTenantId(tenantId);
        try {
            userRepository.findAll().stream()
                    .filter(u -> u.getStatus() == UserStatus.ACTIVE)
                    .forEach(u -> {
                        u.setStatus(UserStatus.SUSPENDED);
                        userRepository.save(u);
                    });
        } finally {
            TenantContext.clear();
        }

        log.info("Tenant {} suspended.", tenantId);
        return TenantSummaryDto.fromEntity(tenant);
    }

    @Transactional
    public TenantSummaryDto updateTenantPlan(UUID tenantId, UpdateTenantPlanRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "TENANT_NOT_FOUND", "Tenant not found: " + tenantId));

        tenant.setPlan(request.getPlan());

        // Use request overrides if specified, otherwise use plan defaults
        if (request.getMaxBranches() != null) {
            tenant.setMaxBranches(request.getMaxBranches());
        } else {
            int[] limits = planLimits(request.getPlan());
            tenant.setMaxBranches(limits[0]);
            tenant.setMaxUsers(limits[1]);
            tenant.setMaxProducts(limits[2]);
        }
        if (request.getMaxUsers() != null) tenant.setMaxUsers(request.getMaxUsers());
        if (request.getMaxProducts() != null) tenant.setMaxProducts(request.getMaxProducts());

        return TenantSummaryDto.fromEntity(tenantRepository.save(tenant));
    }

    /** Returns [maxBranches, maxUsers, maxProducts] for a given plan. */
    private int[] planLimits(PlanType plan) {
        return switch (plan) {
            case STARTER      -> new int[]{1,  3,   5_000};
            case BUSINESS     -> new int[]{3, 15,  20_000};
            case PROFESSIONAL -> new int[]{10, 50, 50_000};
            case ENTERPRISE   -> new int[]{50, 500, 500_000};
        };
    }
}
