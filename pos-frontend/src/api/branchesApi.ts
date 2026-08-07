import apiClient from './client';
import {
  ApiResponse,
  BranchDto,
  BranchQueryParams,
  CreateBranchRequest,
  PageResponse,
  UpdateBranchRequest,
} from './types';

/**
 * Store Branches API Service
 * Endpoints: /api/v1/branches
 */
export const branchesApi = {
  /**
   * List store outlet locations
   * GET /api/v1/branches
   */
  async getBranches(params?: BranchQueryParams): Promise<ApiResponse<PageResponse<BranchDto> | BranchDto[]>> {
    return apiClient.get<never, ApiResponse<PageResponse<BranchDto> | BranchDto[]>>('/branches', { params });
  },

  /**
   * Fetch store branch details by UUID or URL slug
   * GET /api/v1/branches/{idOrSlug}
   */
  async getBranchByIdOrSlug(idOrSlug: string): Promise<ApiResponse<BranchDto>> {
    return apiClient.get<never, ApiResponse<BranchDto>>(`/branches/${idOrSlug}`);
  },

  /**
   * Create a new store branch
   * POST /api/v1/branches
   */
  async createBranch(payload: CreateBranchRequest): Promise<ApiResponse<BranchDto>> {
    return apiClient.post<never, ApiResponse<BranchDto>>('/branches', payload);
  },

  /**
   * Update store branch profile and operating status
   * PUT /api/v1/branches/{id}
   */
  async updateBranch(id: string, payload: UpdateBranchRequest): Promise<ApiResponse<BranchDto>> {
    return apiClient.put<never, ApiResponse<BranchDto>>(`/branches/${id}`, payload);
  },

  /**
   * Close or deactivate store branch
   * DELETE /api/v1/branches/{id}
   */
  async deleteBranch(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<never, ApiResponse<void>>(`/branches/${id}`);
  },
};

export default branchesApi;
