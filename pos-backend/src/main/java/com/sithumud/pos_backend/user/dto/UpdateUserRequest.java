package com.sithumud.pos_backend.user.dto;

import com.sithumud.pos_backend.auth.entity.Role;
import com.sithumud.pos_backend.auth.entity.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUserRequest {

    @NotBlank(message = "User name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String password;
    private Role role;
    private UserStatus status;
    private String branchSlug;
    private String avatarUrl;
}
