import apiClient from './client';
import {
  ApiResponse,
  AskDataRequest,
  AskDataResponse,
  BranchProfitabilityDto,
  CashFlowDto,
  CategoryBreakdownDto,
  PnLDto,
  ProductMarginDto,
  RevenueSeriesDto,
  RevenueSeriesInterval,
  SalesSummaryDto,
} from './types';

/**
 * Reports & Financial Analytics API Service
 * Endpoints: /api/v1/analytics
 */
export const analyticsApi = {
  /**
   * Fetch gross revenue, transactions, average basket & discount summary
   * GET /api/v1/analytics/sales-summary
   */
  async getSalesSummary(branchSlug?: string): Promise<ApiResponse<SalesSummaryDto>> {
    return apiClient.get<never, ApiResponse<SalesSummaryDto>>('/analytics/sales-summary', {
      params: { branchSlug },
    });
  },

  /**
   * Fetch time-bucketed revenue & transaction chart series
   * GET /api/v1/analytics/revenue-series?interval=DAILY
   */
  async getRevenueSeries(
    interval: RevenueSeriesInterval = 'DAILY',
    branchSlug?: string
  ): Promise<ApiResponse<RevenueSeriesDto>> {
    return apiClient.get<never, ApiResponse<RevenueSeriesDto>>('/analytics/revenue-series', {
      params: { interval, branchSlug },
    });
  },

  /**
   * Fetch category revenue share & percentage breakdown
   * GET /api/v1/analytics/category-breakdown
   */
  async getCategoryBreakdown(branchSlug?: string): Promise<ApiResponse<CategoryBreakdownDto>> {
    return apiClient.get<never, ApiResponse<CategoryBreakdownDto>>('/analytics/category-breakdown', {
      params: { branchSlug },
    });
  },

  /**
   * Fetch Profit & Loss Income Statement (Gross, Net, COGS, Overhead, Profit)
   * GET /api/v1/analytics/pnl
   */
  async getPnL(branchSlug?: string): Promise<ApiResponse<PnLDto>> {
    return apiClient.get<never, ApiResponse<PnLDto>>('/analytics/pnl', {
      params: { branchSlug },
    });
  },

  /**
   * Fetch comparative outlet revenue matrix & total live stock asset valuations
   * GET /api/v1/analytics/branch-profitability
   */
  async getBranchProfitability(): Promise<ApiResponse<BranchProfitabilityDto>> {
    return apiClient.get<never, ApiResponse<BranchProfitabilityDto>>('/analytics/branch-profitability');
  },

  /**
   * Fetch payment settlement distribution (CASH, CARD, SPLIT) & tender totals
   * GET /api/v1/analytics/cash-flow
   */
  async getCashFlow(branchSlug?: string): Promise<ApiResponse<CashFlowDto>> {
    return apiClient.get<never, ApiResponse<CashFlowDto>>('/analytics/cash-flow', {
      params: { branchSlug },
    });
  },

  /**
   * Fetch SKU profit unit margin analysis & cost-to-retail ratios
   * GET /api/v1/analytics/product-margins
   */
  async getProductMargins(branchSlug?: string): Promise<ApiResponse<ProductMarginDto[]>> {
    return apiClient.get<never, ApiResponse<ProductMarginDto[]>>('/analytics/product-margins', {
      params: { branchSlug },
    });
  },

  /**
   * Execute natural language analytical executive query
   * POST /api/v1/analytics/ask-data
   */
  async askData(payload: AskDataRequest): Promise<ApiResponse<AskDataResponse>> {
    return apiClient.post<never, ApiResponse<AskDataResponse>>('/analytics/ask-data', payload);
  },
};

export default analyticsApi;
