package com.sithumud.pos_backend.branch.dto;

import com.sithumud.pos_backend.branch.entity.BranchStatus;
import jakarta.validation.constraints.NotBlank;
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
public class UpdateBranchRequest {

    @NotBlank(message = "Branch name is required")
    private String name;

    private String shortName;
    private String address;
    private String phone;
    private UUID managerId;
    private String opensAt;
    private String closesAt;
    private Integer terminalCount;
    private BranchStatus status;
}
