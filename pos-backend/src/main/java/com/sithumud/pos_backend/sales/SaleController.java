package com.sithumud.pos_backend.sales;

import com.sithumud.pos_backend.common.dto.ApiResponse;
import com.sithumud.pos_backend.sales.dto.ReceiptDto;
import com.sithumud.pos_backend.sales.dto.RefundSaleRequest;
import com.sithumud.pos_backend.sales.dto.SaleDto;
import com.sithumud.pos_backend.sales.dto.SaleSearchFilter;
import com.sithumud.pos_backend.sales.dto.VoidSaleRequest;
import com.sithumud.pos_backend.sales.entity.PaymentMethod;
import com.sithumud.pos_backend.sales.entity.SaleStatus;
import com.sithumud.pos_backend.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
@RequestMapping("/api/v1/sales")
@RequiredArgsConstructor
@Tag(name = "Sales History & Ledger", description = "Endpoints for sales ledger history, transaction details, voids, refunds, and thermal receipts")
public class SaleController {

    private final SaleService saleService;

    @GetMapping
    @Operation(summary = "Get sales history", description = "Retrieves a paginated list of historical sales with filters for date range, branch, cashier, payment method, transaction status, and receipt search.")
    public ResponseEntity<ApiResponse<Page<SaleDto>>> getSalesHistory(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String branchSlug,
            @RequestParam(required = false) UUID cashierId,
            @RequestParam(required = false) PaymentMethod paymentMethod,
            @RequestParam(required = false) SaleStatus status,
            @RequestParam(required = false) Instant startDate,
            @RequestParam(required = false) Instant endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "soldAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        SaleSearchFilter filter = SaleSearchFilter.builder()
                .search(search)
                .branchSlug(branchSlug)
                .cashierId(cashierId)
                .paymentMethod(paymentMethod)
                .status(status)
                .startDate(startDate)
                .endDate(endDate)
                .build();

        Page<SaleDto> sales = saleService.getSalesHistory(filter, pageable);
        return ResponseEntity.ok(ApiResponse.success(sales, "Sales history retrieved successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get sale by ID", description = "Fetches full transaction ledger details, item snapshots, and payment tenders for a single sale.")
    public ResponseEntity<ApiResponse<SaleDto>> getSaleById(@PathVariable UUID id) {
        SaleDto sale = saleService.getSaleById(id);
        return ResponseEntity.ok(ApiResponse.success(sale, "Sale details retrieved successfully"));
    }

    @PostMapping("/{id}/void")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Void completed sale", description = "Voids a completed sale, records a shift void audit entry, and restores inventory quantities.")
    public ResponseEntity<ApiResponse<SaleDto>> voidSale(
            @PathVariable UUID id,
            @Valid @RequestBody VoidSaleRequest request,
            @AuthenticationPrincipal UserPrincipal user
    ) {
        SaleDto voidedSale = saleService.voidSale(id, request, user);
        return ResponseEntity.ok(ApiResponse.success(voidedSale, "Sale voided successfully and inventory restored"));
    }

    @PostMapping("/{id}/refund")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Refund completed sale", description = "Processes a full or partial sale refund.")
    public ResponseEntity<ApiResponse<SaleDto>> refundSale(
            @PathVariable UUID id,
            @Valid @RequestBody RefundSaleRequest request,
            @AuthenticationPrincipal UserPrincipal user
    ) {
        SaleDto refundedSale = saleService.refundSale(id, request, user);
        return ResponseEntity.ok(ApiResponse.success(refundedSale, "Sale refunded successfully"));
    }

    @GetMapping("/{id}/receipt")
    @Operation(summary = "Get receipt data", description = "Returns receipt data formatted for thermal receipt printers and customer viewing.")
    public ResponseEntity<ApiResponse<ReceiptDto>> getReceipt(@PathVariable UUID id) {
        ReceiptDto receipt = saleService.getReceipt(id);
        return ResponseEntity.ok(ApiResponse.success(receipt, "Receipt formatted successfully"));
    }
}
