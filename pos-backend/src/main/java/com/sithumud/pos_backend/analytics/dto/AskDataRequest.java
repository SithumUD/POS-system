package com.sithumud.pos_backend.analytics.dto;

import jakarta.validation.constraints.NotBlank;
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
public class AskDataRequest {

    @NotBlank(message = "Query prompt cannot be empty")
    private String query;

    private String branchSlug;
}
