package com.sithumud.pos_backend.user.dto;

import com.sithumud.pos_backend.auth.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RolePermissionMatrixDto {

    private Map<Role, List<String>> rolePermissions;
}
