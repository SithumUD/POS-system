import apiClient from './client';
import {
  ApiResponse,
  CreateSupplierRequest,
  PageResponse,
  SupplierDto,
  SupplierQueryParams,
  UpdateSupplierRequest,
} from './types';

/**
 * Supplier Registry API Service
 * Endpoints: /api/v1/suppliers
 */
export const suppliersApi = {
  /**
   * List registered suppliers with search & status filters
   * GET /api/v1/suppliers
   */
  async getSuppliers(params?: SupplierQueryParams): Promise<ApiResponse<PageResponse<SupplierDto>>> {
    return apiClient.get<never, ApiResponse<PageResponse<SupplierDto>>>('/suppliers', { params });
  },

  /**
   * Register a new supplier vendor
   * POST /api/v1/suppliers
   */
  async createSupplier(payload: CreateSupplierRequest): Promise<ApiResponse<SupplierDto>> {
    return apiClient.post<never, ApiResponse<SupplierDto>>('/suppliers', payload);
  },

  /**
   * Update supplier vendor profile
   * PUT /api/v1/suppliers/{id}
   */
  async updateSupplier(id: string, payload: UpdateSupplierRequest): Promise<ApiResponse<SupplierDto>> {
    return apiClient.put<never, ApiResponse<SupplierDto>>(`/suppliers/${id}`, payload);
  },

  /**
   * Remove supplier vendor
   * DELETE /api/v1/suppliers/{id}
   */
  async deleteSupplier(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<never, ApiResponse<void>>(`/suppliers/${id}`);
  },
};

export default suppliersApi;
