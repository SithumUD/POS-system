package com.sithumud.pos_backend.branch.dto;

import com.sithumud.pos_backend.branch.entity.Branch;
import com.sithumud.pos_backend.branch.entity.BranchStatus;
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
public class BranchDto {

    private UUID id;
    private String slug;
    private String name;
    private String shortName;
    private String address;
    private String phone;
    private UUID managerId;
    private String managerName;
    private String managerEmail;
    private String opensAt;
    private String closesAt;
    private Integer terminalCount;
    private BranchStatus status;

    public static BranchDto fromEntity(Branch branch) {
        if (branch == null) return null;

        return BranchDto.builder()
                .id(branch.getId())
                .slug(branch.getSlug())
                .name(branch.getName())
                .shortName(branch.getShortName())
                .address(branch.getAddress())
                .phone(branch.getPhone())
                .managerId(branch.getManager() != null ? branch.getManager().getId() : null)
                .managerName(branch.getManager() != null ? branch.getManager().getName() : null)
                .managerEmail(branch.getManager() != null ? branch.getManager().getEmail() : null)
                .opensAt(branch.getOpensAt())
                .closesAt(branch.getClosesAt())
                .terminalCount(branch.getTerminalCount())
                .status(branch.getStatus())
                .build();
    }
}
