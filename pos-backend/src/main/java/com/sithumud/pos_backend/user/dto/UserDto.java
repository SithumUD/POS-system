package com.sithumud.pos_backend.user.dto;

import com.sithumud.pos_backend.auth.entity.Role;
import com.sithumud.pos_backend.auth.entity.User;
import com.sithumud.pos_backend.auth.entity.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
    private String branchSlug;
    private String branchName;
    private String avatarUrl;

    public static UserDto fromEntity(User user) {
        if (user == null) return null;

        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .branchSlug(user.getBranch() != null ? user.getBranch().getSlug() : null)
                .branchName(user.getBranch() != null ? user.getBranch().getName() : null)
                .avatarUrl(user.getAvatarUrl())
                .build();
    }
}
