package com.sithumud.pos_backend.product.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.sithumud.pos_backend.product.entity.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CategoryDto {

    private UUID id;
    private String name;
    private String slug;
    private UUID parentId;
    private String parentName;
    private Integer displayOrder;
    private Long productCount;
    private List<CategoryDto> children;

    public static CategoryDto fromEntity(Category category) {
        if (category == null) {
            return null;
        }
        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .parentName(category.getParent() != null ? category.getParent().getName() : null)
                .displayOrder(category.getDisplayOrder())
                .build();
    }
}
