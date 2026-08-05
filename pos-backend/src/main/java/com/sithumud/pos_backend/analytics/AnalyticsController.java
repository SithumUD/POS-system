package com.sithumud.pos_backend.analytics;

import com.sithumud.pos_backend.analytics.dto.AskDataRequest;
import com.sithumud.pos_backend.analytics.dto.AskDataResponse;
import com.sithumud.pos_backend.analytics.dto.BranchProfitabilityDto;
import com.sithumud.pos_backend.analytics.dto.CashFlowDto;
import com.sithumud.pos_backend.analytics.dto.CategoryBreakdownDto;
import com.sithumud.pos_backend.analytics.dto.PnlStatementDto;
import com.sithumud.pos_backend.analytics.dto.ProductMarginDto;
import com.sithumud.pos_backend.analytics.dto.RevenueSeriesPointDto;
import com.sithumud.pos_backend.analytics.dto.SalesSummaryDto;
import com.sithumud.pos_backend.common.dto.ApiResponse;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Tag(name = "Reports & Financial Analytics", description = "Endpoints for sales summary, P&L statements, time series, outlet profitability, stock asset valuations, and AI ask-data executive insights")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/sales-summary")
    @Operation(summary = "Get sales summary", description = "Returns overall summary statistics (Gross Revenue, Transactions, Average Basket, Items Sold, Discounts).")
    public ResponseEntity<ApiResponse<SalesSummaryDto>> getSalesSummary(
            @RequestParam(required = false) String branchSlug,
            @RequestParam(required = false) Instant startDate,
            @RequestParam(required = false) Instant endDate
    ) {
        SalesSummaryDto summary = analyticsService.getSalesSummary(branchSlug, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(summary, "Sales summary retrieved successfully"));
    }

    @GetMapping("/revenue-series")
    @Operation(summary = "Get time-series revenue", description = "Returns time-series revenue and transaction count data (daily or hourly).")
    public ResponseEntity<ApiResponse<List<RevenueSeriesPointDto>>> getRevenueSeries(
            @RequestParam(required = false) String branchSlug,
            @RequestParam(required = false) Instant startDate,
            @RequestParam(required = false) Instant endDate,
            @RequestParam(defaultValue = "DAILY") String interval
    ) {
        List<RevenueSeriesPointDto> points = analyticsService.getRevenueSeries(branchSlug, startDate, endDate, interval);
        return ResponseEntity.ok(ApiResponse.success(points, "Time-series revenue data retrieved successfully"));
    }

    @GetMapping("/category-breakdown")
    @Operation(summary = "Get category breakdown", description = "Returns revenue and volume breakdown by product category.")
    public ResponseEntity<ApiResponse<List<CategoryBreakdownDto>>> getCategoryBreakdown(
            @RequestParam(required = false) String branchSlug,
            @RequestParam(required = false) Instant startDate,
            @RequestParam(required = false) Instant endDate
    ) {
        List<CategoryBreakdownDto> breakdown = analyticsService.getCategoryBreakdown(branchSlug, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(breakdown, "Category breakdown retrieved successfully"));
    }

    @GetMapping("/pnl")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Generate P&L Statement", description = "Generates Profit & Loss Income Statement (Gross Sales, Discounts, Net Revenue, COGS, Gross Profit, Operating Overhead, Net Profit). Restricted to Manager/Admin.")
    public ResponseEntity<ApiResponse<PnlStatementDto>> getPnlStatement(
            @RequestParam(required = false) String branchSlug,
            @RequestParam(required = false) Instant startDate,
            @RequestParam(required = false) Instant endDate
    ) {
        PnlStatementDto pnl = analyticsService.getPnlStatement(branchSlug, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(pnl, "P&L income statement generated successfully"));
    }

    @GetMapping("/branch-profitability")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get branch profitability & asset valuations", description = "Generates comparative outlet profitability matrix and stock asset valuations. Restricted to Manager/Admin.")
    public ResponseEntity<ApiResponse<List<BranchProfitabilityDto>>> getBranchProfitability(
            @RequestParam(required = false) Instant startDate,
            @RequestParam(required = false) Instant endDate
    ) {
        List<BranchProfitabilityDto> list = analyticsService.getBranchProfitability(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(list, "Branch profitability and asset valuations retrieved successfully"));
    }

    @GetMapping("/cash-flow")
    @Operation(summary = "Get cash flow & tender settlement", description = "Returns payment settlement distribution (Cash, Card, Split) and tender reconciliation.")
    public ResponseEntity<ApiResponse<CashFlowDto>> getCashFlow(
            @RequestParam(required = false) String branchSlug,
            @RequestParam(required = false) Instant startDate,
            @RequestParam(required = false) Instant endDate
    ) {
        CashFlowDto cashFlow = analyticsService.getCashFlow(branchSlug, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(cashFlow, "Cash flow settlement data retrieved successfully"));
    }

    @GetMapping("/product-margins")
    @Operation(summary = "Get SKU product margins", description = "Returns SKU-level profit margin analysis and cost-to-retail ratios.")
    public ResponseEntity<ApiResponse<Page<ProductMarginDto>>> getProductMargins(
            @RequestParam(required = false) String branchSlug,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ProductMarginDto> margins = analyticsService.getProductMargins(branchSlug, categoryId, search, pageable);
        return ResponseEntity.ok(ApiResponse.success(margins, "Product margins retrieved successfully"));
    }

    @PostMapping("/ask-data")
    @Operation(summary = "Executive NLP Query Assistant", description = "Processes natural language analytical queries to return executive financial and operational insights.")
    public ResponseEntity<ApiResponse<AskDataResponse>> askData(@Valid @RequestBody AskDataRequest request) {
        AskDataResponse response = analyticsService.askData(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Executive data query processed successfully"));
    }
}
