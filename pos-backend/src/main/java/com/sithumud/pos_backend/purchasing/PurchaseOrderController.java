package com.sithumud.pos_backend.purchasing;

import com.sithumud.pos_backend.common.dto.ApiResponse;
import com.sithumud.pos_backend.purchasing.dto.CreatePurchaseOrderRequest;
import com.sithumud.pos_backend.purchasing.dto.PurchaseOrderDto;
import com.sithumud.pos_backend.purchasing.dto.PurchaseOrderSearchFilter;
import com.sithumud.pos_backend.purchasing.dto.ReceivePurchaseOrderRequest;
import com.sithumud.pos_backend.purchasing.dto.UpdatePurchaseOrderRequest;
import com.sithumud.pos_backend.purchasing.entity.PurchaseOrderStatus;
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
@RequestMapping("/api/v1/purchase-orders")
@RequiredArgsConstructor
@Tag(name = "Purchasing & Procurement", description = "Endpoints for purchase orders, item lines, stock receiving engine, and activity timeline")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @GetMapping
    @Operation(summary = "Get purchase orders", description = "Retrieves purchase orders filtered by branch, supplier, and PO status.")
    public ResponseEntity<ApiResponse<Page<PurchaseOrderDto>>> getPurchaseOrders(
            @RequestParam(required = false) String branchSlug,
            @RequestParam(required = false) UUID supplierId,
            @RequestParam(required = false) PurchaseOrderStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PurchaseOrderSearchFilter filter = PurchaseOrderSearchFilter.builder()
                .branchSlug(branchSlug)
                .supplierId(supplierId)
                .status(status)
                .search(search)
                .build();

        Page<PurchaseOrderDto> poPage = purchaseOrderService.getPurchaseOrders(filter, pageable);
        return ResponseEntity.ok(ApiResponse.success(poPage, "Purchase orders retrieved successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get purchase order by ID", description = "Fetches purchase order details, item lines, expected delivery, and activity timeline.")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> getPurchaseOrderById(@PathVariable UUID id) {
        PurchaseOrderDto po = purchaseOrderService.getPurchaseOrderById(id);
        return ResponseEntity.ok(ApiResponse.success(po, "Purchase order details retrieved successfully"));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Create purchase order", description = "Creates a new purchase order draft or marks it as sent.")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> createPurchaseOrder(
            @Valid @RequestBody CreatePurchaseOrderRequest request,
            @AuthenticationPrincipal UserPrincipal user
    ) {
        PurchaseOrderDto po = purchaseOrderService.createPurchaseOrder(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(po, "Purchase order created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Update purchase order", description = "Updates purchase order lines and notes.")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> updatePurchaseOrder(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePurchaseOrderRequest request,
            @AuthenticationPrincipal UserPrincipal user
    ) {
        PurchaseOrderDto po = purchaseOrderService.updatePurchaseOrder(id, request, user);
        return ResponseEntity.ok(ApiResponse.success(po, "Purchase order updated successfully"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Update purchase order status", description = "Updates purchase order status (DRAFT, SENT, CLOSED, CANCELLED).")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> updateStatus(
            @PathVariable("id") UUID id,
            @RequestParam("status") PurchaseOrderStatus status,
            org.springframework.security.core.Authentication authentication
    ) {
        UserPrincipal user = (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) ? principal : null;
        PurchaseOrderDto po = purchaseOrderService.updateStatus(id, status, user);
        return ResponseEntity.ok(ApiResponse.success(po, "Purchase order status updated successfully"));
    }

    @PostMapping("/{id}/receive")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Receive stock shipment", description = "Receives stock shipment against a purchase order, credits inventory stock, and logs stock movements.")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> receiveStock(
            @PathVariable UUID id,
            @Valid @RequestBody ReceivePurchaseOrderRequest request,
            @AuthenticationPrincipal UserPrincipal user
    ) {
        PurchaseOrderDto po = purchaseOrderService.receiveStock(id, request, user);
        return ResponseEntity.ok(ApiResponse.success(po, "Shipment received and inventory stock credited successfully"));
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Cancel or delete purchase order", description = "Cancels or deletes a purchase order.")
    public ResponseEntity<ApiResponse<Void>> deletePurchaseOrder(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal user
    ) {
        purchaseOrderService.deletePurchaseOrder(id, user);
        return ResponseEntity.ok(ApiResponse.success(null, "Purchase order cancelled/deleted successfully"));
    }
}
