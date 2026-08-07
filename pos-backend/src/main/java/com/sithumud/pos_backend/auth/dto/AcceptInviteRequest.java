package com.sithumud.pos_backend.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AcceptInviteRequest {
    @NotBlank
    private String token;

    @NotBlank
    private String password;
}
