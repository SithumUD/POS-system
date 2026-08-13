import apiClient from './client';
import {
  ApiResponse,
  CreatePoRequest,
  PageResponse,
  PoQueryParams,
  PurchaseOrderDto,
  PurchaseOrderStatus,
  ReceivePoRequest,
} from './types';

/**
 * Purchase Orders & Shipment Receiving API Service
 * Endpoints: /api/v1/purchase-orders
 */
export const purchaseOrdersApi = {
  /**
   * List purchase orders filtered by branch, supplier, and status
   * GET /api/v1/purchase-orders
   */
  async getPurchaseOrders(params?: PoQueryParams): Promise<ApiResponse<PageResponse<PurchaseOrderDto>>> {
    return apiClient.get<never, ApiResponse<PageResponse<PurchaseOrderDto>>>('/purchase-orders', { params });
  },

  /**
   * Fetch purchase order details, item lines & activity timeline
   * GET /api/v1/purchase-orders/{id}
   */
  async getPurchaseOrderById(id: string): Promise<ApiResponse<PurchaseOrderDto>> {
    return apiClient.get<never, ApiResponse<PurchaseOrderDto>>(`/purchase-orders/${id}`);
  },

  /**
   * Create a new purchase order draft
   * POST /api/v1/purchase-orders
   */
  async createPurchaseOrder(payload: CreatePoRequest): Promise<ApiResponse<PurchaseOrderDto>> {
    return apiClient.post<never, ApiResponse<PurchaseOrderDto>>('/purchase-orders', payload);
  },

  /**
   * Update purchase order status (DRAFT, SENT, CLOSED, CANCELLED)
   * PATCH /api/v1/purchase-orders/{id}/status?status=SENT
   */
  async updatePoStatus(id: string, status: PurchaseOrderStatus): Promise<ApiResponse<PurchaseOrderDto>> {
    return apiClient.patch<never, ApiResponse<PurchaseOrderDto>>(`/purchase-orders/${id}/status`, null, {
      params: { status },
    });
  },

  /**
   * Receive shipment delivery against PO & credit inventory stock
   * POST /api/v1/purchase-orders/{id}/receive
   */
  async receivePurchaseOrder(id: string, payload: ReceivePoRequest): Promise<ApiResponse<PurchaseOrderDto>> {
    return apiClient.post<never, ApiResponse<PurchaseOrderDto>>(`/purchase-orders/${id}/receive`, payload);
  },
};

export default purchaseOrdersApi;
