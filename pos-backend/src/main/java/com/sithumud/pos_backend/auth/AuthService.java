package com.sithumud.pos_backend.auth;

import com.sithumud.pos_backend.auth.dto.AuthResponse;
import com.sithumud.pos_backend.auth.dto.LoginRequest;
import com.sithumud.pos_backend.auth.dto.RefreshTokenRequest;
import com.sithumud.pos_backend.auth.dto.UserDto;
import com.sithumud.pos_backend.auth.entity.Role;
import com.sithumud.pos_backend.auth.entity.User;
import com.sithumud.pos_backend.auth.entity.UserStatus;
import com.sithumud.pos_backend.common.exception.ApiException;
import com.sithumud.pos_backend.security.JwtTokenProvider;
import com.sithumud.pos_backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.sithumud.pos_backend.auth.dto.AcceptInviteRequest;
import com.sithumud.pos_backend.auth.dto.InvitationDetailsDto;
import com.sithumud.pos_backend.auth.dto.SignupInviteDetailsDto;
import com.sithumud.pos_backend.auth.dto.TenantSignupRequest;
import com.sithumud.pos_backend.tenant.TenantRepository;
import com.sithumud.pos_backend.tenant.entity.Tenant;
import com.sithumud.pos_backend.tenant.entity.TenantStatus;

import com.sithumud.pos_backend.tenant.context.TenantContext;
import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final TenantRepository tenantRepository;

    public AuthResponse login(LoginRequest request) {
        UUID tenantId = userRepository.findTenantIdByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found."));
        TenantContext.setTenantId(tenantId);
        try {
            Authentication authentication;
            try {
                authentication = authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
                );
            } catch (BadCredentialsException ex) {
                throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Invalid email or password.");
            }

            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findByEmailWithBranch(userPrincipal.getEmail())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found."));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ApiException(HttpStatus.FORBIDDEN, "ACCOUNT_NOT_ACTIVE", "User account is suspended or has not activated their password.");
        }

        user.setLastActiveAt(Instant.now());
        userRepository.save(user);

        UserPrincipal updatedPrincipal = UserPrincipal.create(user);
        String accessToken = tokenProvider.generateAccessTokenForUser(updatedPrincipal);
        String refreshToken = tokenProvider.generateRefreshTokenForUser(updatedPrincipal);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getAccessTokenExpirationMs() / 1000)
                .user(UserDto.fromEntity(user))
                .build();
        } finally {
            TenantContext.clear();
        }
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!tokenProvider.validateToken(refreshToken)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_REFRESH_TOKEN", "Invalid or expired refresh token.");
        }

        String tokenType = tokenProvider.getTokenType(refreshToken);
        if (!"REFRESH".equals(tokenType)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_TOKEN_TYPE", "Token provided is not a refresh token.");
        }

        String email = tokenProvider.getEmailFromToken(refreshToken);
        UUID tenantId = userRepository.findTenantIdByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found."));
        TenantContext.setTenantId(tenantId);
        try {
            User user = userRepository.findByEmailWithBranch(email)
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found."));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ApiException(HttpStatus.FORBIDDEN, "ACCOUNT_NOT_ACTIVE", "User account is not active.");
        }

        user.setLastActiveAt(Instant.now());
        userRepository.save(user);

        UserPrincipal userPrincipal = UserPrincipal.create(user);
        String newAccessToken = tokenProvider.generateAccessTokenForUser(userPrincipal);
        String newRefreshToken = tokenProvider.generateRefreshTokenForUser(userPrincipal);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getAccessTokenExpirationMs() / 1000)
                .user(UserDto.fromEntity(user))
                .build();
        } finally {
            TenantContext.clear();
        }
    }

    @Transactional
    public UserDto getCurrentUserContext(UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "User context is missing.");
        }

        User user = userRepository.findByEmailWithBranch(currentUser.getEmail())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found."));

        user.setLastActiveAt(Instant.now());
        userRepository.save(user);

        return UserDto.fromEntity(user);
    }

    public InvitationDetailsDto getInvitationDetails(String token) {
        UUID tenantId = userRepository.findTenantIdByInvitationToken(token)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "INVALID_TOKEN", "Invitation link is invalid or expired."));
        TenantContext.setTenantId(tenantId);
        try {
            User user = userRepository.findByInvitationToken(token)
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "INVALID_TOKEN", "Invitation link is invalid or expired."));

        if (user.getInvitationTokenExpiresAt() != null && user.getInvitationTokenExpiresAt().isBefore(Instant.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "TOKEN_EXPIRED", "Invitation link has expired.");
        }

        if (user.getStatus() != UserStatus.INVITED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "ALREADY_ACCEPTED", "This invitation has already been accepted.");
        }

            return InvitationDetailsDto.builder()
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .branchName(user.getBranch() != null ? user.getBranch().getName() : "All Branches (Global Access)")
                    .build();
        } finally {
            TenantContext.clear();
        }
    }

    public AuthResponse acceptInvitation(AcceptInviteRequest request) {
        UUID tenantId = userRepository.findTenantIdByInvitationToken(request.getToken())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "INVALID_TOKEN", "Invitation link is invalid or expired."));
        TenantContext.setTenantId(tenantId);
        try {
            User user = userRepository.findByInvitationToken(request.getToken())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "INVALID_TOKEN", "Invitation link is invalid or expired."));

        if (user.getInvitationTokenExpiresAt() != null && user.getInvitationTokenExpiresAt().isBefore(Instant.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "TOKEN_EXPIRED", "Invitation link has expired.");
        }

        if (user.getStatus() != UserStatus.INVITED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "ALREADY_ACCEPTED", "This invitation has already been accepted.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setStatus(UserStatus.ACTIVE);
        user.setInvitationToken(null);
        user.setInvitationTokenExpiresAt(null);
        user.setLastActiveAt(Instant.now());

        userRepository.save(user);

        UserPrincipal userPrincipal = UserPrincipal.create(user);
        String accessToken = tokenProvider.generateAccessTokenForUser(userPrincipal);
        String refreshToken = tokenProvider.generateRefreshTokenForUser(userPrincipal);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getAccessTokenExpirationMs() / 1000)
                .user(UserDto.fromEntity(user))
                .build();
        } finally {
            TenantContext.clear();
        }
    }

    /** Returns plan details for a signup invitation token (public endpoint). */
    public SignupInviteDetailsDto getSignupInviteDetails(String token) {
        Tenant tenant = tenantRepository.findBySignupToken(token)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "INVALID_TOKEN", "Signup invitation is invalid or expired."));

        if (tenant.getSignupTokenExpiresAt() != null && tenant.getSignupTokenExpiresAt().isBefore(Instant.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "TOKEN_EXPIRED", "Signup invitation has expired. Please contact NexPOS Team.");
        }

        if (tenant.getStatus() != TenantStatus.INVITED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "ALREADY_USED", "This invitation has already been used.");
        }

        return SignupInviteDetailsDto.builder()
                .contactEmail(tenant.getContactEmail())
                .plan(tenant.getPlan())
                .maxUsers(tenant.getMaxUsers())
                .maxBranches(tenant.getMaxBranches())
                .maxProducts(tenant.getMaxProducts())
                .build();
    }

    /** Processes the tenant signup form. Creates the admin user in SUSPENDED state pending approval. */
    @Transactional
    public void completeTenantSignup(TenantSignupRequest request) {
        Tenant tenant = tenantRepository.findBySignupToken(request.getSignupToken())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "INVALID_TOKEN", "Signup invitation is invalid or expired."));

        if (tenant.getSignupTokenExpiresAt() != null && tenant.getSignupTokenExpiresAt().isBefore(Instant.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "TOKEN_EXPIRED", "Signup invitation has expired.");
        }

        if (tenant.getStatus() != TenantStatus.INVITED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "ALREADY_USED", "This invitation has already been used.");
        }

        String adminEmail = request.getAdminEmail().trim().toLowerCase();
        if (userRepository.findTenantIdByEmail(adminEmail).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "EMAIL_ALREADY_EXISTS", "Email is already registered: " + adminEmail);
        }

        // Fill in business details and advance status to PENDING_APPROVAL
        tenant.setName(request.getBusinessName().trim());
        tenant.setBusinessAddress(request.getBusinessAddress());
        tenant.setBusinessPhone(request.getBusinessPhone());
        tenant.setStatus(TenantStatus.PENDING_APPROVAL);
        tenant.setSignupToken(null);          // Invalidate after use
        tenant.setSignupTokenExpiresAt(null);
        tenantRepository.save(tenant);

        // Create ADMIN user — SUSPENDED until super-admin approval
        TenantContext.setTenantId(tenant.getId());
        try {
            userRepository.save(User.builder()
                    .name(request.getAdminName().trim())
                    .email(adminEmail)
                    .passwordHash(passwordEncoder.encode(request.getAdminPassword()))
                    .role(Role.ADMIN)
                    .status(UserStatus.SUSPENDED)
                    .build());
        } finally {
            TenantContext.clear();
        }

        log.info("Tenant signup completed for '{}' (email={}). Awaiting manual payment and approval.",
                tenant.getName(), tenant.getContactEmail());
    }
}
