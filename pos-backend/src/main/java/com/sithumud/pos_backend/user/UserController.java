package com.sithumud.pos_backend.user;

import com.sithumud.pos_backend.auth.entity.Role;
import com.sithumud.pos_backend.auth.entity.UserStatus;
import com.sithumud.pos_backend.common.dto.ApiResponse;
import com.sithumud.pos_backend.user.dto.CreateUserRequest;
import com.sithumud.pos_backend.user.dto.RolePermissionMatrixDto;
import com.sithumud.pos_backend.user.dto.UpdateUserRequest;
import com.sithumud.pos_backend.user.dto.UserDto;
import com.sithumud.pos_backend.user.dto.UserSearchFilter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "User Administration & Role Permissions", description = "Endpoints for user management, role assignments, user status lifecycle, and role-permission matrices")
public class UserController {

    private final UserService userService;

    @GetMapping("/api/v1/users")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get team users", description = "Lists team users, assigned branches, roles (ADMIN, MANAGER, CASHIER), and account status.")
    public ResponseEntity<ApiResponse<Page<UserDto>>> getUsers(
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(required = false) String branchSlug,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("DESC") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        UserSearchFilter filter = UserSearchFilter.builder()
                .role(role)
                .status(status)
                .branchSlug(branchSlug)
                .search(search)
                .build();

        Page<UserDto> users = userService.getUsers(filter, pageable);
        return ResponseEntity.ok(ApiResponse.success(users, "Team users retrieved successfully"));
    }

    @GetMapping("/api/v1/users/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get user by ID", description = "Fetches user profile details by UUID.")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable("id") UUID id) {
        UserDto user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user, "User profile retrieved successfully"));
    }

    @PostMapping("/api/v1/users")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Create team user account", description = "Creates or invites a new team user account.")
    public ResponseEntity<ApiResponse<UserDto>> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserDto user = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(user, "User account created successfully"));
    }

    @PutMapping("/api/v1/users/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Update user account", description = "Updates user profile details, email, assigned branch, role, or status.")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @PathVariable("id") UUID id,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        UserDto user = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success(user, "User account updated successfully"));
    }

    @PatchMapping("/api/v1/users/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user status", description = "Suspends or reactivates a user account (ACTIVE, SUSPENDED, INVITED).")
    public ResponseEntity<ApiResponse<UserDto>> updateUserStatus(
            @PathVariable("id") UUID id,
            @RequestParam("status") UserStatus status
    ) {
        UserDto user = userService.updateUserStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(user, "User status updated successfully"));
    }

    @DeleteMapping("/api/v1/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete/Suspend user account", description = "Deactivates or suspends a team user account.")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable("id") UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User account suspended successfully"));
    }

    @GetMapping("/api/v1/roles/permissions")
    @Operation(summary = "Get role-permission access matrix", description = "Retrieves the capability permissions mapped to each user role (ADMIN, MANAGER, CASHIER).")
    public ResponseEntity<ApiResponse<RolePermissionMatrixDto>> getRolePermissions() {
        RolePermissionMatrixDto matrix = userService.getRolePermissions();
        return ResponseEntity.ok(ApiResponse.success(matrix, "Role-permission matrix retrieved successfully"));
    }

    @PutMapping("/api/v1/roles/permissions")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update role permissions matrix", description = "Updates capability permissions assigned to user roles.")
    public ResponseEntity<ApiResponse<RolePermissionMatrixDto>> updateRolePermissions(@RequestBody RolePermissionMatrixDto request) {
        RolePermissionMatrixDto matrix = userService.updateRolePermissions(request);
        return ResponseEntity.ok(ApiResponse.success(matrix, "Role-permission matrix updated successfully"));
    }
}
