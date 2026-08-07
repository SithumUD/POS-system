package com.sithumud.pos_backend.auth.dto;

import com.sithumud.pos_backend.auth.entity.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InvitationDetailsDto {
    private String name;
    private String email;
    private Role role;
    private String branchName;
}
