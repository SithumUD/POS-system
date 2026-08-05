package com.sithumud.pos_backend.purchasing;

import com.sithumud.pos_backend.common.dto.ApiResponse;
import com.sithumud.pos_backend.purchasing.dto.CreateSupplierRequest;
import com.sithumud.pos_backend.purchasing.dto.SupplierDto;
import com.sithumud.pos_backend.purchasing.dto.SupplierSearchFilter;
import com.sithumud.pos_backend.purchasing.dto.UpdateSupplierRequest;
import com.sithumud.pos_backend.purchasing.entity.SupplierStatus;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/suppliers")
@RequiredArgsConstructor
@Tag(name = "Supplier Management", description = "Endpoints for managing vendors, suppliers, payment terms, and lead times")
public class SupplierController {

    private final SupplierService supplierService;

    @GetMapping
    @Operation(summary = "Get suppliers", description = "Lists registered suppliers, contact persons, payment terms, and supplied categories.")
    public ResponseEntity<ApiResponse<Page<SupplierDto>>> getSuppliers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) SupplierStatus status,
            @RequestParam(required = false) String categorySlug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        SupplierSearchFilter filter = SupplierSearchFilter.builder()
                .search(search)
                .status(status)
                .categorySlug(categorySlug)
                .build();

        Page<SupplierDto> suppliers = supplierService.getSuppliers(filter, pageable);
        return ResponseEntity.ok(ApiResponse.success(suppliers, "Suppliers retrieved successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get supplier by ID", description = "Fetches comprehensive details for a single supplier.")
    public ResponseEntity<ApiResponse<SupplierDto>> getSupplierById(@PathVariable UUID id) {
        SupplierDto supplier = supplierService.getSupplierById(id);
        return ResponseEntity.ok(ApiResponse.success(supplier, "Supplier details retrieved successfully"));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Register supplier", description = "Registers a new vendor/supplier in the system.")
    public ResponseEntity<ApiResponse<SupplierDto>> createSupplier(@Valid @RequestBody CreateSupplierRequest request) {
        SupplierDto supplier = supplierService.createSupplier(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(supplier, "Supplier registered successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Update supplier", description = "Updates supplier contact details, payment terms, lead time, and status.")
    public ResponseEntity<ApiResponse<SupplierDto>> updateSupplier(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateSupplierRequest request
    ) {
        SupplierDto supplier = supplierService.updateSupplier(id, request);
        return ResponseEntity.ok(ApiResponse.success(supplier, "Supplier updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Delete supplier", description = "Deletes a supplier record.")
    public ResponseEntity<ApiResponse<Void>> deleteSupplier(@PathVariable UUID id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Supplier deleted successfully"));
    }
}
