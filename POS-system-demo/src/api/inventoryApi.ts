import apiClient from './client';
import {
  ApiResponse,
  BranchStockDto,
  BranchStockQueryParams,
  CreateTransferRequest,
  MovementQueryParams,
  PageResponse,
  StockAdjustmentRequest,
  StockMovementDto,
  StockTransferDto,
  TransferQueryParams,
} from './types';

/**
 * Inventory Control & Stock Movements API Service
 * Endpoints: /api/v1/inventory
 */
export const inventoryApi = {
  /**
   * Fetch live inventory stock levels per branch
   * GET /api/v1/inventory/stock
   */
  async getStock(params: BranchStockQueryParams): Promise<ApiResponse<PageResponse<BranchStockDto>>> {
    return apiClient.get<never, ApiResponse<PageResponse<BranchStockDto>>>('/inventory/stock', { params });
  },

  /**
   * Record manual stock adjustment (ADD, REMOVE, CORRECTION)
   * POST /api/v1/inventory/adjust
   */
  async adjustStock(payload: StockAdjustmentRequest): Promise<ApiResponse<BranchStockDto>> {
    return apiClient.post<never, ApiResponse<BranchStockDto>>('/inventory/adjustments', payload);
  },

  /**
   * Fetch append-only stock movement audit ledger
   * GET /api/v1/inventory/movements
   */
  async getMovements(params?: MovementQueryParams): Promise<ApiResponse<PageResponse<StockMovementDto>>> {
    return apiClient.get<never, ApiResponse<PageResponse<StockMovementDto>>>('/inventory/movements', { params });
  },

  /**
   * List inter-branch stock transfers
   * GET /api/v1/inventory/transfers
   */
  async getTransfers(params?: TransferQueryParams): Promise<ApiResponse<PageResponse<StockTransferDto>>> {
    return apiClient.get<never, ApiResponse<PageResponse<StockTransferDto>>>('/inventory/transfers', { params });
  },

  /**
   * Create an inter-branch stock transfer request
   * POST /api/v1/inventory/transfers
   */
  async createTransfer(payload: CreateTransferRequest): Promise<ApiResponse<StockTransferDto>> {
    return apiClient.post<never, ApiResponse<StockTransferDto>>('/inventory/transfers', payload);
  },

  /**
   * Finalize and complete an in-transit stock transfer
   * POST /api/v1/inventory/transfers/{id}/complete
   */
  async completeTransfer(id: string): Promise<ApiResponse<StockTransferDto>> {
    return apiClient.post<never, ApiResponse<StockTransferDto>>(`/inventory/transfers/${id}/complete`);
  },

  /**
   * Cancel a pending or in-transit stock transfer
   * POST /api/v1/inventory/transfers/{id}/cancel
   */
  async cancelTransfer(id: string): Promise<ApiResponse<StockTransferDto>> {
    return apiClient.post<never, ApiResponse<StockTransferDto>>(`/inventory/transfers/${id}/cancel`);
  },
};

export default inventoryApi;
