package com.sithumud.pos_backend.auth;

import com.sithumud.pos_backend.auth.dto.AuthResponse;
import com.sithumud.pos_backend.auth.dto.LoginRequest;
import com.sithumud.pos_backend.auth.dto.RefreshTokenRequest;
import com.sithumud.pos_backend.auth.dto.UserDto;
import com.sithumud.pos_backend.common.dto.ApiResponse;
import com.sithumud.pos_backend.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication & Session Management", description = "Endpoints for user login, token refresh, and profile retrieval")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Login user", description = "Authenticates user credentials and returns access and refresh JWT tokens with profile & permissions.")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token", description = "Issues a new JWT access token using a valid refresh token.")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Token refreshed successfully"));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user context", description = "Fetches the currently authenticated user's profile, branch, and role permissions.")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(@AuthenticationPrincipal UserPrincipal currentUser) {
        UserDto userDto = authService.getCurrentUserContext(currentUser);
        return ResponseEntity.ok(ApiResponse.success(userDto, "User context retrieved successfully"));
    }

    @GetMapping("/invite/{token}")
    @Operation(summary = "Get invitation details", description = "Fetches details of a user invitation by token.")
    public ResponseEntity<ApiResponse<com.sithumud.pos_backend.auth.dto.InvitationDetailsDto>> getInvitationDetails(
            @org.springframework.web.bind.annotation.PathVariable String token) {
        var details = authService.getInvitationDetails(token);
        return ResponseEntity.ok(ApiResponse.success(details, "Invitation details retrieved successfully"));
    }

    @PostMapping("/accept-invite")
    @Operation(summary = "Accept invitation", description = "Sets user password and activates account via invitation token.")
    public ResponseEntity<ApiResponse<AuthResponse>> acceptInvitation(
            @Valid @RequestBody com.sithumud.pos_backend.auth.dto.AcceptInviteRequest request) {
        AuthResponse response = authService.acceptInvitation(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Account activated successfully"));
    }

    @GetMapping("/signup-invite/{token}")
    @Operation(summary = "Get signup invitation details", description = "Returns the plan details for a business signup invitation. Public endpoint.")
    public ResponseEntity<ApiResponse<com.sithumud.pos_backend.auth.dto.SignupInviteDetailsDto>> getSignupInviteDetails(
            @org.springframework.web.bind.annotation.PathVariable String token) {
        var details = authService.getSignupInviteDetails(token);
        return ResponseEntity.ok(ApiResponse.success(details, "Signup invitation details retrieved successfully"));
    }

    @PostMapping("/signup")
    @Operation(summary = "Complete business signup", description = "Submits business and admin account details. Tenant is created in PENDING_APPROVAL state awaiting manual payment confirmation.")
    public ResponseEntity<ApiResponse<Void>> completeTenantSignup(
            @Valid @RequestBody com.sithumud.pos_backend.auth.dto.TenantSignupRequest request) {
        authService.completeTenantSignup(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Signup submitted successfully. Your account will be activated after payment confirmation."));
    }
}
