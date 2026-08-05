package com.sithumud.pos_backend.auth.dto;

import com.sithumud.pos_backend.branch.entity.Branch;
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
public class BranchSummaryDto {

    private UUID id;
    private String slug;
    private String name;
    private String shortName;

    public static BranchSummaryDto fromEntity(Branch branch) {
        if (branch == null) {
            return null;
        }
        return BranchSummaryDto.builder()
                .id(branch.getId())
                .slug(branch.getSlug())
                .name(branch.getName())
                .shortName(branch.getShortName())
                .build();
    }
}
