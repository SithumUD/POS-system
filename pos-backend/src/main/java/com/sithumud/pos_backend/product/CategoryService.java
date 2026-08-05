package com.sithumud.pos_backend.product;

import com.sithumud.pos_backend.common.exception.ApiException;
import com.sithumud.pos_backend.product.dto.CategoryDto;
import com.sithumud.pos_backend.product.dto.CreateCategoryRequest;
import com.sithumud.pos_backend.product.dto.UpdateCategoryRequest;
import com.sithumud.pos_backend.product.entity.Category;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<CategoryDto> getCategoryHierarchy() {
        List<Category> topCategories = categoryRepository.findAllByParentIsNullOrderByDisplayOrderAsc();

        return topCategories.stream().map(parent -> {
            CategoryDto dto = CategoryDto.fromEntity(parent);
            long parentCount = categoryRepository.countProductsByCategory(parent);
            dto.setProductCount(parentCount);

            List<Category> subCategories = categoryRepository.findAllByParentIdOrderByDisplayOrderAsc(parent.getId());
            List<CategoryDto> childrenDtos = subCategories.stream().map(child -> {
                CategoryDto childDto = CategoryDto.fromEntity(child);
                childDto.setProductCount(categoryRepository.countProductsByCategory(child));
                return childDto;
            }).collect(Collectors.toList());

            dto.setChildren(childrenDtos);
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryDto getCategoryById(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CATEGORY_NOT_FOUND", "Category not found with ID: " + id));

        CategoryDto dto = CategoryDto.fromEntity(category);
        dto.setProductCount(categoryRepository.countProductsByCategory(category));

        List<Category> children = categoryRepository.findAllByParentIdOrderByDisplayOrderAsc(category.getId());
        if (!children.isEmpty()) {
            dto.setChildren(children.stream().map(child -> {
                CategoryDto childDto = CategoryDto.fromEntity(child);
                childDto.setProductCount(categoryRepository.countProductsByCategory(child));
                return childDto;
            }).collect(Collectors.toList()));
        }

        return dto;
    }

    @Transactional
    public CategoryDto createCategory(CreateCategoryRequest request) {
        String slug = generateSlug(request.getName(), request.getSlug());

        if (categoryRepository.existsBySlug(slug)) {
            throw new ApiException(HttpStatus.CONFLICT, "DUPLICATE_SLUG", "Category with slug '" + slug + "' already exists.");
        }

        Category parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PARENT_CATEGORY_NOT_FOUND", "Parent category not found with ID: " + request.getParentId()));
        }

        Category category = Category.builder()
                .name(request.getName().trim())
                .slug(slug)
                .parent(parent)
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .build();

        Category saved = categoryRepository.save(category);
        return CategoryDto.fromEntity(saved);
    }

    @Transactional
    public CategoryDto updateCategory(UUID id, UpdateCategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CATEGORY_NOT_FOUND", "Category not found with ID: " + id));

        String slug = generateSlug(request.getName(), request.getSlug());
        if (!category.getSlug().equals(slug) && categoryRepository.existsBySlug(slug)) {
            throw new ApiException(HttpStatus.CONFLICT, "DUPLICATE_SLUG", "Category with slug '" + slug + "' already exists.");
        }

        if (request.getParentId() != null) {
            if (request.getParentId().equals(id)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_PARENT", "Category cannot be its own parent.");
            }
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PARENT_CATEGORY_NOT_FOUND", "Parent category not found with ID: " + request.getParentId()));
            category.setParent(parent);
        } else {
            category.setParent(null);
        }

        category.setName(request.getName().trim());
        category.setSlug(slug);
        if (request.getDisplayOrder() != null) {
            category.setDisplayOrder(request.getDisplayOrder());
        }

        Category saved = categoryRepository.save(category);
        return CategoryDto.fromEntity(saved);
    }

    @Transactional
    public void deleteCategory(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CATEGORY_NOT_FOUND", "Category not found with ID: " + id));

        long productCount = categoryRepository.countProductsByCategory(category);
        if (productCount > 0) {
            throw new ApiException(HttpStatus.CONFLICT, "CATEGORY_HAS_PRODUCTS", "Cannot delete category assigned to " + productCount + " products.");
        }

        List<Category> children = categoryRepository.findAllByParentIdOrderByDisplayOrderAsc(id);
        if (!children.isEmpty()) {
            throw new ApiException(HttpStatus.CONFLICT, "CATEGORY_HAS_CHILDREN", "Cannot delete category containing sub-categories.");
        }

        categoryRepository.delete(category);
    }

    private String generateSlug(String name, String customSlug) {
        if (StringUtils.hasText(customSlug)) {
            return customSlug.trim().toLowerCase().replaceAll("[^a-z0-9-]+", "-").replaceAll("^-|-$", "");
        }
        return name.trim().toLowerCase().replaceAll("[^a-z0-9-]+", "-").replaceAll("^-|-$", "");
    }
}
