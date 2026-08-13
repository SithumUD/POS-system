import apiClient from './client';
import { ApiResponse, PageResponse, RefundSaleRequest, SaleDto, SaleFilterParams, VoidSaleRequest } from './types';

/**
 * Sales Ledger & Receipts API Service
 * Endpoints: /api/v1/sales
 */
export const salesApi = {
  /**
   * Fetch paginated list of historical sales ledger with filters
   * GET /api/v1/sales
   */
  async getSales(params?: SaleFilterParams): Promise<ApiResponse<PageResponse<SaleDto>>> {
    return apiClient.get<never, ApiResponse<PageResponse<SaleDto>>>('/sales', { params });
  },

  /**
   * Fetch full details for a single sale transaction
   * GET /api/v1/sales/{id}
   */
  async getSaleById(id: string): Promise<ApiResponse<SaleDto>> {
    return apiClient.get<never, ApiResponse<SaleDto>>(`/sales/${id}`);
  },

  /**
   * Void sale transaction, restore stock & record audit movement
   * POST /api/v1/sales/{id}/void
   */
  async voidSale(id: string, payload?: VoidSaleRequest): Promise<ApiResponse<SaleDto>> {
    return apiClient.post<never, ApiResponse<SaleDto>>(`/sales/${id}/void`, payload || { reason: 'Customer requested void' });
  },

  /**
   * Process sale refund (full or partial)
   * POST /api/v1/sales/{id}/refund
   */
  async refundSale(id: string, payload: RefundSaleRequest): Promise<ApiResponse<SaleDto>> {
    return apiClient.post<never, ApiResponse<SaleDto>>(`/sales/${id}/refund`, payload);
  },

  /**
   * Retrieve ESC/POS 80mm thermal receipt text string
   * GET /api/v1/sales/{id}/receipt
   */
  async getReceiptText(id: string): Promise<ApiResponse<string>> {
    return apiClient.get<never, ApiResponse<string>>(`/sales/${id}/receipt`);
  },

  /**
   * Retrieve ESC/POS 80mm thermal receipt as Base64 for Bluetooth Printers
   * GET /api/v1/sales/{id}/print
   */
  async getPrintReceiptData(id: string): Promise<ApiResponse<string>> {
    return apiClient.get<never, ApiResponse<string>>(`/sales/${id}/print`);
  },
};

export default salesApi;
