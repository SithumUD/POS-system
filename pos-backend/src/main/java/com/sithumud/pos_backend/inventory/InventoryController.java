package com.sithumud.pos_backend.inventory;

import com.sithumud.pos_backend.common.dto.ApiResponse;
import com.sithumud.pos_backend.inventory.dto.CreateStockTransferRequest;
import com.sithumud.pos_backend.inventory.dto.StockAdjustmentRequest;
import com.sithumud.pos_backend.inventory.dto.StockAdjustmentResponse;
import com.sithumud.pos_backend.inventory.dto.StockLevelDto;
import com.sithumud.pos_backend.inventory.dto.StockMovementDto;
import com.sithumud.pos_backend.inventory.dto.StockMovementSearchFilter;
import com.sithumud.pos_backend.inventory.dto.StockSearchFilter;
import com.sithumud.pos_backend.inventory.dto.StockTransferDto;
import com.sithumud.pos_backend.inventory.dto.StockTransferSearchFilter;
import com.sithumud.pos_backend.inventory.entity.StockMovementType;
import com.sithumud.pos_backend.inventory.entity.TransferStatus;
import com.sithumud.pos_backend.product.dto.StockStatus;
import com.sithumud.pos_backend.security.UserPrincipal;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory Control & Stock Movements", description = "Endpoints for live stock monitoring, manual adjustments, audit logs, and inter-branch transfers")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/stock")
    @Operation(summary = "Get live stock levels", description = "Fetches live stock quantities per product per branch with search and stock status filtering.")
    public ResponseEntity<ApiResponse<Page<StockLevelDto>>> getLiveStock(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String branchSlug,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) UUID supplierId,
            @RequestParam(required = false) StockStatus stockStatus,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "quantityOnHand") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        StockSearchFilter filter = StockSearchFilter.builder()
                .search(search)
                .branchSlug(branchSlug)
                .categoryId(categoryId)
                .supplierId(supplierId)
                .stockStatus(stockStatus)
                .build();

        Page<StockLevelDto> stockPage = inventoryService.getLiveStock(filter, pageable);
        return ResponseEntity.ok(ApiResponse.success(stockPage, "Live stock levels retrieved successfully"));
    }

    @PostMapping("/adjustments")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Record stock adjustment", description = "Records manual stock adjustments (ADD, REMOVE, CORRECTION) for spoilage, theft, damage, or stocktakes.")
    public ResponseEntity<ApiResponse<StockAdjustmentResponse>> adjustStock(
            @Valid @RequestBody StockAdjustmentRequest request,
            @AuthenticationPrincipal UserPrincipal user
    ) {
        StockAdjustmentResponse response = inventoryService.adjustStock(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "Stock adjustment recorded successfully"));
    }

    @GetMapping("/movements")
    @Operation(summary = "Get stock movement logs", description = "Retrieves stock movement audit logs (Sales, Purchases, Adjustments, Transfers, Voids).")
    public ResponseEntity<ApiResponse<Page<StockMovementDto>>> getStockMovements(
            @RequestParam(required = false) UUID productId,
            @RequestParam(required = false) String branchSlug,
            @RequestParam(required = false) StockMovementType type,
            @RequestParam(required = false) String referenceId,
            @RequestParam(required = false) Instant startDate,
            @RequestParam(required = false) Instant endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        StockMovementSearchFilter filter = StockMovementSearchFilter.builder()
                .productId(productId)
                .branchSlug(branchSlug)
                .type(type)
                .referenceId(referenceId)
                .startDate(startDate)
                .endDate(endDate)
                .build();

        Page<StockMovementDto> movements = inventoryService.getStockMovements(filter, pageable);
        return ResponseEntity.ok(ApiResponse.success(movements, "Stock movement audit logs retrieved successfully"));
    }

    @GetMapping("/transfers")
    @Operation(summary = "List stock transfers", description = "Lists stock transfers between branches with status filtering.")
    public ResponseEntity<ApiResponse<Page<StockTransferDto>>> getTransfers(
            @RequestParam(required = false) String fromBranchSlug,
            @RequestParam(required = false) String toBranchSlug,
            @RequestParam(required = false) TransferStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        StockTransferSearchFilter filter = StockTransferSearchFilter.builder()
                .fromBranchSlug(fromBranchSlug)
                .toBranchSlug(toBranchSlug)
                .status(status)
                .build();

        Page<StockTransferDto> transfers = inventoryService.getTransfers(filter, pageable);
        return ResponseEntity.ok(ApiResponse.success(transfers, "Stock transfers retrieved successfully"));
    }

    @PostMapping("/transfers")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Create stock transfer", description = "Creates a stock transfer request between two store branches and deducts source branch stock.")
    public ResponseEntity<ApiResponse<StockTransferDto>> createTransfer(
            @Valid @RequestBody CreateStockTransferRequest request,
            @AuthenticationPrincipal UserPrincipal user
    ) {
        StockTransferDto transfer = inventoryService.createTransfer(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(transfer, "Stock transfer created successfully and dispatched"));
    }

    @PostMapping("/transfers/{id}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Complete stock transfer", description = "Completes a stock transfer and credits destination branch stock.")
    public ResponseEntity<ApiResponse<StockTransferDto>> completeTransfer(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal user
    ) {
        StockTransferDto transfer = inventoryService.completeTransfer(id, user);
        return ResponseEntity.ok(ApiResponse.success(transfer, "Stock transfer completed successfully and credited"));
    }

    @PostMapping("/transfers/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Cancel stock transfer", description = "Cancels an in-transit stock transfer and restores source branch stock.")
    public ResponseEntity<ApiResponse<StockTransferDto>> cancelTransfer(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal user
    ) {
        StockTransferDto transfer = inventoryService.cancelTransfer(id, user);
        return ResponseEntity.ok(ApiResponse.success(transfer, "Stock transfer cancelled successfully and stock restored"));
    }
}
