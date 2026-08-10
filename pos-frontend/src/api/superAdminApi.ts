import apiClient from './client';
import {
  ApiResponse,
  TenantSummaryDto,
  InviteBusinessRequest,
  UpdateTenantPlanRequest
} from './types';

export const superAdminApi = {
  getAllTenants: async () => {
    const response = await apiClient.get<ApiResponse<TenantSummaryDto[]>>('/super-admin/tenants');
    return response.data;
  },

  inviteBusiness: async (data: InviteBusinessRequest) => {
    const response = await apiClient.post<ApiResponse<TenantSummaryDto>>('/super-admin/invite', data);
    return response.data;
  },

  approveTenant: async (id: string) => {
    const response = await apiClient.post<ApiResponse<TenantSummaryDto>>(`/super-admin/tenants/${id}/approve`);
    return response.data;
  },

  suspendTenant: async (id: string) => {
    const response = await apiClient.post<ApiResponse<TenantSummaryDto>>(`/super-admin/tenants/${id}/suspend`);
    return response.data;
  },

  updateTenantPlan: async (id: string, data: UpdateTenantPlanRequest) => {
    const response = await apiClient.put<ApiResponse<TenantSummaryDto>>(`/super-admin/tenants/${id}/plan`, data);
    return response.data;
  }
};
