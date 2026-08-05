package com.sithumud.pos_backend.pos;

import com.sithumud.pos_backend.common.dto.ApiResponse;
import com.sithumud.pos_backend.sales.HeldSaleService;
import com.sithumud.pos_backend.sales.SaleService;
import com.sithumud.pos_backend.sales.dto.BatchSyncRequest;
import com.sithumud.pos_backend.sales.dto.BatchSyncResultDto;
import com.sithumud.pos_backend.sales.dto.CheckoutRequest;
import com.sithumud.pos_backend.sales.dto.CheckoutResponse;
import com.sithumud.pos_backend.sales.dto.HeldSaleDto;
import com.sithumud.pos_backend.sales.dto.HeldSaleRequest;
import com.sithumud.pos_backend.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pos")
@RequiredArgsConstructor
@Tag(name = "POS Terminal & Checkout", description = "Endpoints for atomic checkout, batch offline sync, and parked carts")
public class PosController {

    private final SaleService saleService;
    private final HeldSaleService heldSaleService;

    @PostMapping("/checkout")
    @Operation(summary = "Process POS checkout", description = "Processes an atomic POS sale transaction, deducts branch stock, applies discounts/taxes, and records payment tenders. Idempotency key supported.")
    public ResponseEntity<ApiResponse<CheckoutResponse>> checkout(
            @Valid @RequestBody CheckoutRequest request,
            @AuthenticationPrincipal UserPrincipal cashier
    ) {
        CheckoutResponse response = saleService.processCheckout(request, cashier);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "Checkout completed successfully"));
    }

    @PostMapping("/sync-batch")
    @Operation(summary = "Synchronize batch offline sales", description = "Synchronizes a batch of offline sales queued by a terminal during network outages.")
    public ResponseEntity<ApiResponse<List<BatchSyncResultDto>>> syncBatch(
            @Valid @RequestBody BatchSyncRequest request,
            @AuthenticationPrincipal UserPrincipal cashier
    ) {
        List<BatchSyncResultDto> results = saleService.processBatchSync(request, cashier);
        return ResponseEntity.ok(ApiResponse.success(results, "Batch offline sales synchronization completed"));
    }

    @PostMapping("/held-sales")
    @Operation(summary = "Park/hold POS cart", description = "Parks/holds an active POS cart for later recall.")
    public ResponseEntity<ApiResponse<HeldSaleDto>> parkCart(
            @Valid @RequestBody HeldSaleRequest request,
            @AuthenticationPrincipal UserPrincipal cashier
    ) {
        HeldSaleDto heldSale = heldSaleService.parkCart(request, cashier);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(heldSale, "Cart parked successfully"));
    }

    @GetMapping("/held-sales")
    @Operation(summary = "Get held carts", description = "Retrieves held/parked carts for a store branch.")
    public ResponseEntity<ApiResponse<List<HeldSaleDto>>> getHeldSales(
            @RequestParam(required = false, defaultValue = "colombo") String branchSlug
    ) {
        List<HeldSaleDto> heldSales = heldSaleService.getHeldSales(branchSlug);
        return ResponseEntity.ok(ApiResponse.success(heldSales, "Held carts retrieved successfully"));
    }

    @DeleteMapping("/held-sales/{id}")
    @Operation(summary = "Discard held cart", description = "Discards a held sale basket.")
    public ResponseEntity<ApiResponse<Void>> discardHeldSale(@PathVariable UUID id) {
        heldSaleService.discardHeldSale(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Held cart discarded successfully"));
    }
}
