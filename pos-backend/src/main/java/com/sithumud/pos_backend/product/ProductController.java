package com.sithumud.pos_backend.product;

import com.sithumud.pos_backend.common.dto.ApiResponse;
import com.sithumud.pos_backend.product.dto.CreateProductRequest;
import com.sithumud.pos_backend.product.dto.ProductDto;
import com.sithumud.pos_backend.product.dto.ProductSearchFilter;
import com.sithumud.pos_backend.product.dto.StockStatus;
import com.sithumud.pos_backend.product.dto.UpdateProductRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Tag(name = "Products & Catalogue", description = "Endpoints for product SKU management, search, and stock level distribution")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Get products list", description = "Retrieves a paginated list of product SKUs with search, category, supplier, stock status, and branch stock filters.")
    public ResponseEntity<ApiResponse<Page<ProductDto>>> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) String categorySlug,
            @RequestParam(required = false) UUID supplierId,
            @RequestParam(required = false) StockStatus stockStatus,
            @RequestParam(required = false) String branchSlug,
            @RequestParam(defaultValue = "true") Boolean activeOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        ProductSearchFilter filter = ProductSearchFilter.builder()
                .search(search)
                .categoryId(categoryId)
                .categorySlug(categorySlug)
                .supplierId(supplierId)
                .stockStatus(stockStatus)
                .branchSlug(branchSlug)
                .activeOnly(activeOnly)
                .build();

        Page<ProductDto> products = productService.getProducts(filter, pageable);
        return ResponseEntity.ok(ApiResponse.success(products, "Products retrieved successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID", description = "Fetches comprehensive details for a single product SKU, including branch stock distribution.")
    public ResponseEntity<ApiResponse<ProductDto>> getProductById(@PathVariable UUID id) {
        ProductDto product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success(product, "Product retrieved successfully"));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Create product", description = "Creates a new product SKU in the catalogue with optional initial stock levels.")
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(@Valid @RequestBody CreateProductRequest request) {
        ProductDto created = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(created, "Product created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Update product", description = "Updates product details, prices, cost, tax rate, reorder threshold, and preferred supplier.")
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProductRequest request
    ) {
        ProductDto updated = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Product updated successfully"));
    }

    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Toggle product active status", description = "Toggles product active/inactive status.")
    public ResponseEntity<ApiResponse<ProductDto>> toggleActive(@PathVariable UUID id) {
        ProductDto updated = productService.toggleActive(id);
        return ResponseEntity.ok(ApiResponse.success(updated, "Product status updated successfully"));
    }

    @PostMapping("/{id}/duplicate")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Duplicate product", description = "Duplicates an existing product into a draft copy with a new SKU.")
    public ResponseEntity<ApiResponse<ProductDto>> duplicateProduct(@PathVariable UUID id) {
        ProductDto duplicated = productService.duplicateProduct(id);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(duplicated, "Product duplicated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Delete product", description = "Removes or archives a product from the catalogue.")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable UUID id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Product deleted successfully"));
    }
}
