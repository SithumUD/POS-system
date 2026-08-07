import apiClient from './client';
import { ApiResponse, AuthResponse, LoginRequest, RefreshTokenRequest, UserDto } from './types';

/**
 * Authentication API Service
 * Endpoint: /api/v1/auth
 */
export const authApi = {
  /**
   * Authenticate user credentials and return JWT tokens & profile
   * POST /api/v1/auth/login
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<never, ApiResponse<AuthResponse>>('/auth/login', credentials);
    const data = response?.data as any;
    const token = data?.accessToken || data?.token;
    const refreshToken = data?.refreshToken;

    if (response?.success && token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', token);
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }
      }
    }
    return response;
  },

  /**
   * Obtain a new JWT access token using a valid refresh token
   * POST /api/v1/auth/refresh
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string }>> {
    const payload: RefreshTokenRequest = { refreshToken };
    const response = await apiClient.post<never, ApiResponse<{ token: string }>>('/auth/refresh', payload);
    if (response.success && response.data?.token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', response.data.token);
      }
    }
    return response;
  },

  /**
   * Fetch currently authenticated user context & branch permissions
   * GET /api/v1/auth/me
   */
  async getMe(): Promise<ApiResponse<UserDto>> {
    return apiClient.get<never, ApiResponse<UserDto>>('/auth/me');
  },

  /**
   * Helper to perform client-side logout
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },

  /**
   * Get invitation details by token
   * GET /api/v1/auth/invite/{token}
   */
  async getInvitationDetails(token: string): Promise<ApiResponse<any>> {
    return apiClient.get<never, ApiResponse<any>>(`/auth/invite/${token}`);
  },

  /**
   * Accept an invitation and set password
   * POST /api/v1/auth/accept-invite
   */
  async acceptInvitation(payload: { token: string; password: string }): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<never, ApiResponse<AuthResponse>>('/auth/accept-invite', payload);
    const data = response?.data as any;
    const token = data?.accessToken || data?.token;
    const refreshToken = data?.refreshToken;

    if (response?.success && token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', token);
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }
      }
    }
    return response;
  }
};

export default authApi;
