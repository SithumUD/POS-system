package com.sithumud.pos_backend.product;

import com.sithumud.pos_backend.common.dto.ApiResponse;
import com.sithumud.pos_backend.product.dto.CategoryDto;
import com.sithumud.pos_backend.product.dto.CreateCategoryRequest;
import com.sithumud.pos_backend.product.dto.UpdateCategoryRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@Tag(name = "Product Categories", description = "Endpoints for managing product category hierarchy")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "Get category hierarchy", description = "Retrieves top-level categories with sub-categories and product counts.")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getCategories() {
        List<CategoryDto> categories = categoryService.getCategoryHierarchy();
        return ResponseEntity.ok(ApiResponse.success(categories, "Categories retrieved successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single category", description = "Fetches details of a category by ID.")
    public ResponseEntity<ApiResponse<CategoryDto>> getCategoryById(@PathVariable UUID id) {
        CategoryDto category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success(category, "Category retrieved successfully"));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Create category", description = "Creates a new category or sub-category.")
    public ResponseEntity<ApiResponse<CategoryDto>> createCategory(@Valid @RequestBody CreateCategoryRequest request) {
        CategoryDto created = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(created, "Category created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Update category", description = "Updates category details.")
    public ResponseEntity<ApiResponse<CategoryDto>> updateCategory(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateCategoryRequest request
    ) {
        CategoryDto updated = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Category updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Delete category", description = "Removes a category if no products or sub-categories exist.")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable UUID id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Category deleted successfully"));
    }
}
