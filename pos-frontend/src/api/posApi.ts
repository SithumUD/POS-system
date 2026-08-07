import apiClient from './client';
import {
  ApiResponse,
  CheckoutRequest,
  HeldSaleDto,
  ParkCartRequest,
  PosProductDto,
  SaleDto,
  SyncBatchResponse,
} from './types';

/**
 * POS Terminal & Checkout API Service
 * Endpoints: /api/v1/pos
 */
export const posApi = {
  /**
   * Fast cashier product search with live branch inventory stock
   * GET /api/v1/pos/products?branchSlug=colombo&query=anchor
   */
  async searchPosProducts(branchSlug: string, query?: string): Promise<ApiResponse<PosProductDto[]>> {
    return apiClient.get<never, ApiResponse<PosProductDto[]>>('/pos/products', {
      params: { branchSlug, query },
    });
  },

  /**
   * Process atomic sales checkout
   * POST /api/v1/pos/checkout
   * Headers: Idempotency-Key
   */
  async checkout(payload: CheckoutRequest, idempotencyKey?: string): Promise<ApiResponse<SaleDto>> {
    const key = idempotencyKey || payload.idempotencyKey;
    return apiClient.post<never, ApiResponse<SaleDto>>('/pos/checkout', payload, {
      headers: key ? { 'Idempotency-Key': key } : undefined,
    });
  },

  /**
   * Offline sales replay batch synchronization engine
   * POST /api/v1/pos/sync-batch
   */
  async syncBatch(sales: CheckoutRequest[]): Promise<ApiResponse<SyncBatchResponse>> {
    return apiClient.post<never, ApiResponse<SyncBatchResponse>>('/pos/sync-batch', sales);
  },

  /**
   * List pending parked carts for a branch
   * GET /api/v1/pos/held-sales?branchSlug=colombo
   */
  async getHeldSales(branchSlug: string): Promise<ApiResponse<HeldSaleDto[]>> {
    return apiClient.get<never, ApiResponse<HeldSaleDto[]>>('/pos/held-sales', {
      params: { branchSlug },
    });
  },

  /**
   * Park / hold an active POS cart
   * POST /api/v1/pos/held-sales
   */
  async createHeldSale(payload: ParkCartRequest): Promise<ApiResponse<HeldSaleDto>> {
    return apiClient.post<never, ApiResponse<HeldSaleDto>>('/pos/held-sales', payload);
  },

  /**
   * Unpark / discard a held sale cart
   * DELETE /api/v1/pos/held-sales/{id}
   */
  async deleteHeldSale(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<never, ApiResponse<void>>(`/pos/held-sales/${id}`);
  },
};

export default posApi;
