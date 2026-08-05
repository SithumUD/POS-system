package com.sithumud.pos_backend.branch;

import com.sithumud.pos_backend.branch.dto.BranchDto;
import com.sithumud.pos_backend.branch.dto.BranchSearchFilter;
import com.sithumud.pos_backend.branch.dto.CreateBranchRequest;
import com.sithumud.pos_backend.branch.dto.UpdateBranchRequest;
import com.sithumud.pos_backend.branch.entity.BranchStatus;
import com.sithumud.pos_backend.common.dto.ApiResponse;
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
@RequestMapping("/api/v1/branches")
@RequiredArgsConstructor
@Tag(name = "Store Branches", description = "Endpoints for managing retail store outlets, branch status, manager assignments, terminal count, and operating hours")
public class BranchController {

    private final BranchService branchService;

    @GetMapping
    @Operation(summary = "Get store branches", description = "Lists store branches, manager details, operating hours, terminal count, and status.")
    public ResponseEntity<ApiResponse<Page<BranchDto>>> getBranches(
            @RequestParam(required = false) BranchStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("DESC") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        BranchSearchFilter filter = BranchSearchFilter.builder()
                .status(status)
                .search(search)
                .build();

        Page<BranchDto> branches = branchService.getBranches(filter, pageable);
        return ResponseEntity.ok(ApiResponse.success(branches, "Store branches retrieved successfully"));
    }

    @GetMapping("/{idOrSlug}")
    @Operation(summary = "Get branch details", description = "Fetches store branch profile by UUID or slug.")
    public ResponseEntity<ApiResponse<BranchDto>> getBranchByIdOrSlug(@PathVariable("idOrSlug") String idOrSlug) {
        BranchDto branch = branchService.getBranchByIdOrSlug(idOrSlug);
        return ResponseEntity.ok(ApiResponse.success(branch, "Store branch details retrieved successfully"));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Create store branch", description = "Creates a new store branch with manager assignment, operating hours, and terminal count.")
    public ResponseEntity<ApiResponse<BranchDto>> createBranch(@Valid @RequestBody CreateBranchRequest request) {
        BranchDto branch = branchService.createBranch(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(branch, "Store branch created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Update store branch", description = "Updates branch details, address, phone, manager assignment, terminal count, operating hours, and status.")
    public ResponseEntity<ApiResponse<BranchDto>> updateBranch(
            @PathVariable("id") UUID id,
            @Valid @RequestBody UpdateBranchRequest request
    ) {
        BranchDto branch = branchService.updateBranch(id, request);
        return ResponseEntity.ok(ApiResponse.success(branch, "Store branch updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deactivate/Remove store branch", description = "Deactivates or closes a store branch.")
    public ResponseEntity<ApiResponse<Void>> deleteBranch(@PathVariable("id") UUID id) {
        branchService.deleteBranch(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Store branch closed successfully"));
    }
}
