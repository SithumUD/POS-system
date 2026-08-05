package com.sithumud.pos_backend.auth.dto;

import com.sithumud.pos_backend.auth.entity.Role;
import com.sithumud.pos_backend.auth.entity.User;
import com.sithumud.pos_backend.auth.entity.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {

    private UUID id;
    private String name;
    private String email;
    private Role role;
    private UserStatus status;
    private BranchSummaryDto branch;
    private List<String> permissions;
    private Instant lastActiveAt;
    private Instant createdAt;

    public static UserDto fromEntity(User user) {
        if (user == null) {
            return null;
        }
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .branch(BranchSummaryDto.fromEntity(user.getBranch()))
                .permissions(RolePermissions.getPermissionsForRole(user.getRole()))
                .lastActiveAt(user.getLastActiveAt())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
