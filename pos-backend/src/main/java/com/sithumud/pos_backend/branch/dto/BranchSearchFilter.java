package com.sithumud.pos_backend.branch.dto;

import com.sithumud.pos_backend.branch.entity.BranchStatus;
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
public class BranchSearchFilter {

    private BranchStatus status;
    private String search;
}
