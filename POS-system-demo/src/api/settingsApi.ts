import apiClient from './client';
import { ApiResponse, StoreSettingsDto, UpdateSettingsRequest } from './types';

/**
 * Global Store Settings API Service
 * Endpoints: /api/v1/settings
 */
export const settingsApi = {
  /**
   * Fetch global store configuration and policies
   * GET /api/v1/settings
   */
  async getSettings(): Promise<ApiResponse<StoreSettingsDto>> {
    return apiClient.get<never, ApiResponse<StoreSettingsDto>>('/settings');
  },

  /**
   * Update global store settings (Admin restricted)
   * PUT /api/v1/settings
   */
  async updateSettings(payload: UpdateSettingsRequest): Promise<ApiResponse<StoreSettingsDto>> {
    return apiClient.put<never, ApiResponse<StoreSettingsDto>>('/settings', payload);
  },
};

export default settingsApi;
