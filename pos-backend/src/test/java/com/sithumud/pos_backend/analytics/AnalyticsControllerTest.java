package com.sithumud.pos_backend.analytics;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sithumud.pos_backend.analytics.dto.AskDataRequest;
import com.sithumud.pos_backend.analytics.dto.AskDataResponse;
import com.sithumud.pos_backend.analytics.dto.BranchProfitabilityDto;
import com.sithumud.pos_backend.analytics.dto.CashFlowDto;
import com.sithumud.pos_backend.analytics.dto.CategoryBreakdownDto;
import com.sithumud.pos_backend.analytics.dto.PnlStatementDto;
import com.sithumud.pos_backend.analytics.dto.ProductMarginDto;
import com.sithumud.pos_backend.analytics.dto.RevenueSeriesPointDto;
import com.sithumud.pos_backend.analytics.dto.SalesSummaryDto;
import com.sithumud.pos_backend.common.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AnalyticsControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private AnalyticsService analyticsService;

    @InjectMocks
    private AnalyticsController analyticsController;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        mockMvc = MockMvcBuilders.standaloneSetup(analyticsController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setConversionService(new org.springframework.format.support.DefaultFormattingConversionService())
                .build();
    }

    @Test
    void testGetSalesSummarySuccess() throws Exception {
        SalesSummaryDto dto = SalesSummaryDto.builder()
                .grossRevenue(new BigDecimal("150000.00"))
                .totalDiscounts(new BigDecimal("5000.00"))
                .netRevenue(new BigDecimal("145000.00"))
                .totalTransactions(45)
                .averageBasketValue(new BigDecimal("3333.33"))
                .totalItemsSold(120)
                .build();

        given(analyticsService.getSalesSummary(any(), any(), any())).willReturn(dto);

        mockMvc.perform(get("/api/v1/analytics/sales-summary")
                        .param("branchSlug", "colombo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.grossRevenue").value(150000.00))
                .andExpect(jsonPath("$.data.totalTransactions").value(45));
    }

    @Test
    void testGetRevenueSeriesSuccess() throws Exception {
        RevenueSeriesPointDto point = RevenueSeriesPointDto.builder()
                .periodLabel("2026-08-05")
                .revenue(new BigDecimal("45000.00"))
                .transactionCount(15)
                .build();

        given(analyticsService.getRevenueSeries(any(), any(), any(), any())).willReturn(List.of(point));

        mockMvc.perform(get("/api/v1/analytics/revenue-series")
                        .param("interval", "DAILY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].revenue").value(45000.00));
    }

    @Test
    void testGetCategoryBreakdownSuccess() throws Exception {
        CategoryBreakdownDto dto = CategoryBreakdownDto.builder()
                .categoryId(UUID.randomUUID())
                .categoryName("Beverages")
                .revenue(new BigDecimal("60000.00"))
                .totalUnitsSold(80)
                .percentageOfTotal(new BigDecimal("40.00"))
                .build();

        given(analyticsService.getCategoryBreakdown(any(), any(), any())).willReturn(List.of(dto));

        mockMvc.perform(get("/api/v1/analytics/category-breakdown"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].categoryName").value("Beverages"));
    }

    @Test
    void testGetPnlStatementSuccess() throws Exception {
        PnlStatementDto pnl = PnlStatementDto.builder()
                .grossSales(new BigDecimal("200000.00"))
                .discounts(new BigDecimal("10000.00"))
                .netRevenue(new BigDecimal("190000.00"))
                .costOfGoodsSold(new BigDecimal("120000.00"))
                .grossProfit(new BigDecimal("70000.00"))
                .grossMarginPercentage(new BigDecimal("36.84"))
                .operatingOverhead(new BigDecimal("19000.00"))
                .netProfit(new BigDecimal("51000.00"))
                .build();

        given(analyticsService.getPnlStatement(any(), any(), any())).willReturn(pnl);

        mockMvc.perform(get("/api/v1/analytics/pnl"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.netProfit").value(51000.00));
    }

    @Test
    void testGetBranchProfitabilitySuccess() throws Exception {
        BranchProfitabilityDto branchDto = BranchProfitabilityDto.builder()
                .branchSlug("colombo")
                .branchName("Colombo Main Flagship")
                .grossRevenue(new BigDecimal("500000.00"))
                .netRevenue(new BigDecimal("480000.00"))
                .totalOrders(150)
                .stockAssetValuation(new BigDecimal("1200000.00"))
                .build();

        given(analyticsService.getBranchProfitability(any(), any())).willReturn(List.of(branchDto));

        mockMvc.perform(get("/api/v1/analytics/branch-profitability"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].branchSlug").value("colombo"));
    }

    @Test
    void testGetCashFlowSuccess() throws Exception {
        CashFlowDto cashFlow = CashFlowDto.builder()
                .cashTotal(new BigDecimal("80000.00"))
                .cardTotal(new BigDecimal("60000.00"))
                .splitTotal(new BigDecimal("10000.00"))
                .totalTendered(new BigDecimal("160000.00"))
                .totalChangeGiven(new BigDecimal("10000.00"))
                .build();

        given(analyticsService.getCashFlow(any(), any(), any())).willReturn(cashFlow);

        mockMvc.perform(get("/api/v1/analytics/cash-flow"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.cashTotal").value(80000.00));
    }

    @Test
    void testGetProductMarginsSuccess() throws Exception {
        ProductMarginDto margin = ProductMarginDto.builder()
                .productId(UUID.randomUUID())
                .name("Anchor Milk Powder 400g")
                .sku("DRY-AN-400")
                .costPrice(new BigDecimal("550.00"))
                .sellingPrice(new BigDecimal("680.00"))
                .unitMarginAmount(new BigDecimal("130.00"))
                .marginPercentage(new BigDecimal("19.12"))
                .totalUnitsSold(100)
                .totalRevenue(new BigDecimal("68000.00"))
                .build();

        given(analyticsService.getProductMargins(any(), any(), any(), any(Pageable.class)))
                .willReturn(new PageImpl<>(List.of(margin), PageRequest.of(0, 20), 1));

        mockMvc.perform(get("/api/v1/analytics/product-margins")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].sku").value("DRY-AN-400"));
    }

    @Test
    void testAskDataSuccess() throws Exception {
        AskDataResponse response = AskDataResponse.builder()
                .query("What is our total revenue today?")
                .intent("SALES_REVENUE_INQUIRY")
                .textSummary("Current Net Revenue is LKR 145000.00 across 45 transactions.")
                .metricsPayload(Map.of("netRevenue", 145000.00))
                .executiveRecommendation("Maintain promotional discounts to boost average basket value.")
                .build();

        given(analyticsService.askData(any(AskDataRequest.class))).willReturn(response);

        AskDataRequest request = AskDataRequest.builder()
                .query("What is our total revenue today?")
                .branchSlug("colombo")
                .build();

        mockMvc.perform(post("/api/v1/analytics/ask-data")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.intent").value("SALES_REVENUE_INQUIRY"));
    }
}
