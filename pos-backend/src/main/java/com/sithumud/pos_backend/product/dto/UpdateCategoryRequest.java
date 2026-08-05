package com.sithumud.pos_backend.product.dto;

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
public class UpdateCategoryRequest {

    @NotBlank(message = "Category name is required")
    private String name;

    private String slug;

    private UUID parentId;

    private Integer displayOrder;
}
