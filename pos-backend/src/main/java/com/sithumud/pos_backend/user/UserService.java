package com.sithumud.pos_backend.user;

import com.sithumud.pos_backend.auth.UserRepository;
import com.sithumud.pos_backend.auth.entity.Role;
import com.sithumud.pos_backend.auth.entity.User;
import com.sithumud.pos_backend.auth.entity.UserStatus;
import com.sithumud.pos_backend.branch.BranchRepository;
import com.sithumud.pos_backend.branch.entity.Branch;
import com.sithumud.pos_backend.common.exception.ApiException;
import com.sithumud.pos_backend.user.dto.CreateUserRequest;
import com.sithumud.pos_backend.user.dto.RolePermissionMatrixDto;
import com.sithumud.pos_backend.user.dto.UpdateUserRequest;
import com.sithumud.pos_backend.user.dto.UserDto;
import com.sithumud.pos_backend.user.dto.UserSearchFilter;
import com.sithumud.pos_backend.tenant.TenantRepository;
import com.sithumud.pos_backend.tenant.context.TenantContext;
import com.sithumud.pos_backend.tenant.entity.Tenant;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.sithumud.pos_backend.common.email.EmailService;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final TenantRepository tenantRepository;

    private final Map<Role, List<String>> rolePermissionsMap = new EnumMap<>(Role.class);

    {
        rolePermissionsMap.put(Role.ADMIN, List.of(
                "POS_CHECKOUT", "CATALOGUE_MANAGE", "INVENTORY_MANAGE", "PURCHASING_MANAGE",
                "ANALYTICS_VIEW", "ALERTS_MANAGE", "BRANCHES_MANAGE", "SETTINGS_MANAGE", "USERS_MANAGE"
        ));
        rolePermissionsMap.put(Role.MANAGER, List.of(
                "POS_CHECKOUT", "CATALOGUE_MANAGE", "INVENTORY_MANAGE", "PURCHASING_MANAGE",
                "ANALYTICS_VIEW", "ALERTS_MANAGE", "BRANCHES_VIEW"
        ));
        rolePermissionsMap.put(Role.CASHIER, List.of(
                "POS_CHECKOUT", "CATALOGUE_VIEW", "INVENTORY_VIEW"
        ));
        rolePermissionsMap.put(Role.VIEWER, List.of(
                "CATALOGUE_VIEW", "INVENTORY_VIEW", "PURCHASING_VIEW", "ANALYTICS_VIEW", "ALERTS_VIEW", "BRANCHES_VIEW"
        ));
    }

    @Transactional(readOnly = true)
    public Page<UserDto> getUsers(UserSearchFilter filter, Pageable pageable) {
        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getRole() != null) {
                predicates.add(cb.equal(root.get("role"), filter.getRole()));
            }

            if (filter.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), filter.getStatus()));
            }

            if (StringUtils.hasText(filter.getBranchSlug())) {
                predicates.add(cb.equal(root.get("branch").get("slug"), filter.getBranchSlug()));
            }

            if (StringUtils.hasText(filter.getSearch())) {
                String pattern = "%" + filter.getSearch().trim().toLowerCase() + "%";
                Predicate nameLike = cb.like(cb.lower(root.get("name")), pattern);
                Predicate emailLike = cb.like(cb.lower(root.get("email")), pattern);
                predicates.add(cb.or(nameLike, emailLike));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<User> page = userRepository.findAll(spec, pageable);
        List<UserDto> dtos = page.getContent().stream().map(UserDto::fromEntity).collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, page.getTotalElements());
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found: " + id));

        return UserDto.fromEntity(user);
    }

    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        Tenant tenant = tenantRepository.findById(TenantContext.getTenantId())
                .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "TENANT_NOT_FOUND", "Current tenant not found."));
        
        long currentUserCount = userRepository.count();
        if (currentUserCount >= tenant.getMaxUsers()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "LIMIT_EXCEEDED", "Your subscription plan allows a maximum of " + tenant.getMaxUsers() + " users.");
        }

        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new ApiException(HttpStatus.CONFLICT, "EMAIL_ALREADY_EXISTS", "Email is already registered: " + request.getEmail());
        }

        Branch branch = null;
        if (StringUtils.hasText(request.getBranchSlug())) {
            branch = branchRepository.findBySlug(request.getBranchSlug())
                    .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "BRANCH_NOT_FOUND", "Branch not found: " + request.getBranchSlug()));
        }

        UserStatus status = request.getStatus() != null ? request.getStatus() : UserStatus.ACTIVE;
        String invitationToken = null;
        Instant expiresAt = null;

        if (status == UserStatus.INVITED) {
            invitationToken = UUID.randomUUID().toString();
            expiresAt = Instant.now().plus(24, ChronoUnit.HOURS);
        }

        String rawPassword = request.getPassword();
        if (!StringUtils.hasText(rawPassword)) {
            rawPassword = UUID.randomUUID().toString(); // Fallback for invited users
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(rawPassword))
                .role(request.getRole())
                .status(status)
                .branch(branch)
                .avatarUrl(request.getAvatarUrl())
                .invitationToken(invitationToken)
                .invitationTokenExpiresAt(expiresAt)
                .build();

        User saved = userRepository.save(user);

        if (status == UserStatus.INVITED && invitationToken != null) {
            emailService.sendInvitationEmail(saved, invitationToken);
        }

        return UserDto.fromEntity(saved);
    }

    @Transactional
    public UserDto updateUser(UUID id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found: " + id));

        String emailClean = request.getEmail().trim().toLowerCase();
        if (!user.getEmail().equalsIgnoreCase(emailClean) && userRepository.existsByEmail(emailClean)) {
            throw new ApiException(HttpStatus.CONFLICT, "EMAIL_ALREADY_EXISTS", "Email is already registered: " + emailClean);
        }

        Branch branch = null;
        if (StringUtils.hasText(request.getBranchSlug())) {
            branch = branchRepository.findBySlug(request.getBranchSlug())
                    .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "BRANCH_NOT_FOUND", "Branch not found: " + request.getBranchSlug()));
        }

        user.setName(request.getName().trim());
        user.setEmail(emailClean);
        if (StringUtils.hasText(request.getPassword())) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }
        user.setBranch(branch);
        if (StringUtils.hasText(request.getAvatarUrl())) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        User saved = userRepository.save(user);
        return UserDto.fromEntity(saved);
    }

    @Transactional
    public UserDto updateUserStatus(UUID id, UserStatus status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found: " + id));

        user.setStatus(status);
        User saved = userRepository.save(user);
        return UserDto.fromEntity(saved);
    }

    @Transactional
    public void deleteUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found: " + id));

        user.setStatus(UserStatus.SUSPENDED);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public RolePermissionMatrixDto getRolePermissions() {
        return RolePermissionMatrixDto.builder()
                .rolePermissions(rolePermissionsMap)
                .build();
    }

    @Transactional
    public RolePermissionMatrixDto updateRolePermissions(RolePermissionMatrixDto request) {
        if (request != null && request.getRolePermissions() != null) {
            rolePermissionsMap.putAll(request.getRolePermissions());
        }
        return getRolePermissions();
    }
}
