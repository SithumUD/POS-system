package com.sithumud.pos_backend.auth.dto;

import com.sithumud.pos_backend.auth.entity.Role;

import java.util.List;
import java.util.Map;

public class RolePermissions {

    private static final Map<Role, List<String>> ROLE_PERMISSIONS_MAP = Map.of(
            Role.ADMIN, List.of("pos", "refunds", "products", "purchasing", "reports", "settings"),
            Role.MANAGER, List.of("pos", "refunds", "products", "purchasing", "reports"),
            Role.CASHIER, List.of("pos")
    );

    public static List<String> getPermissionsForRole(Role role) {
        if (role == null) {
            return List.of();
        }
        return ROLE_PERMISSIONS_MAP.getOrDefault(role, List.of());
    }
}
