import apiClient from './client';
import {
  AddAlertNoteRequest,
  AlertFilterParams,
  AnomalyAlertDto,
  AnomalyStatus,
  ApiResponse,
  PageResponse,
} from './types';

/**
 * Anomaly Security & Fraud Alerts API Service
 * Endpoints: /api/v1/alerts
 */
export const alertsApi = {
  /**
   * List security & fraud anomaly alerts with filters
   * GET /api/v1/alerts
   */
  async getAlerts(params?: AlertFilterParams): Promise<ApiResponse<PageResponse<AnomalyAlertDto>>> {
    return apiClient.get<never, ApiResponse<PageResponse<AnomalyAlertDto>>>('/alerts', { params });
  },

  /**
   * Trigger real-time heuristic security scan against sales/movement ledgers
   * POST /api/v1/alerts/scan
   */
  async scanAlerts(branchSlug?: string): Promise<ApiResponse<{ scannedRecords: number; newAlerts: number }>> {
    return apiClient.post<never, ApiResponse<{ scannedRecords: number; newAlerts: number }>>('/alerts/scan', null, {
      params: { branchSlug },
    });
  },

  /**
   * Update alert review status (NEW, INVESTIGATING, REVIEWED, DISMISSED)
   * PATCH /api/v1/alerts/{id}/status?status=INVESTIGATING
   */
  async updateAlertStatus(id: string, status: AnomalyStatus): Promise<ApiResponse<AnomalyAlertDto>> {
    return apiClient.patch<never, ApiResponse<AnomalyAlertDto>>(`/alerts/${id}/status`, null, {
      params: { status },
    });
  },

  /**
   * Append investigation note to anomaly alert
   * POST /api/v1/alerts/{id}/notes
   */
  async addAlertNote(id: string, payload: AddAlertNoteRequest): Promise<ApiResponse<AnomalyAlertDto>> {
    return apiClient.post<never, ApiResponse<AnomalyAlertDto>>(`/alerts/${id}/notes`, payload);
  },
};

export default alertsApi;
