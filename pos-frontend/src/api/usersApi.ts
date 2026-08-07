import apiClient from './client';
import {
  ApiResponse,
  CreateUserRequest,
  PageResponse,
  RolePermissionsDto,
  UpdateUserRequest,
  UserDto,
  UserQueryParams,
  UserStatus,
} from './types';

/**
 * User Administration & Role Permissions API Service
 * Endpoints: /api/v1/users, /api/v1/roles/permissions
 */
export const usersApi = {
  // --------------------------------------------------------------------
  // User Management
  // --------------------------------------------------------------------

  /**
   * List staff users with filters
   * GET /api/v1/users
   */
  async getUsers(params?: UserQueryParams): Promise<ApiResponse<PageResponse<UserDto>>> {
    return apiClient.get<never, ApiResponse<PageResponse<UserDto>>>('/users', { params });
  },

  /**
   * Fetch single user details
   * GET /api/v1/users/{id}
   */
  async getUserById(id: string): Promise<ApiResponse<UserDto>> {
    return apiClient.get<never, ApiResponse<UserDto>>(`/users/${id}`);
  },

  /**
   * Create or invite a new staff user
   * POST /api/v1/users
   */
  async createUser(payload: CreateUserRequest): Promise<ApiResponse<UserDto>> {
    return apiClient.post<never, ApiResponse<UserDto>>('/users', payload);
  },

  /**
   * Update user profile details
   * PUT /api/v1/users/{id}
   */
  async updateUser(id: string, payload: UpdateUserRequest): Promise<ApiResponse<UserDto>> {
    return apiClient.put<never, ApiResponse<UserDto>>(`/users/${id}`, payload);
  },

  /**
   * Suspend or reactivate user account
   * PATCH /api/v1/users/{id}/status?status=SUSPENDED
   */
  async updateUserStatus(id: string, status: UserStatus): Promise<ApiResponse<UserDto>> {
    return apiClient.patch<never, ApiResponse<UserDto>>(`/users/${id}/status`, null, {
      params: { status },
    });
  },

  /**
   * Deactivate user account
   * DELETE /api/v1/users/{id}
   */
  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<never, ApiResponse<void>>(`/users/${id}`);
  },

  // --------------------------------------------------------------------
  // Role Capability Permissions Matrix
  // --------------------------------------------------------------------

  /**
   * Fetch role-permission capability matrix
   * GET /api/v1/roles/permissions
   */
  async getRolePermissions(): Promise<ApiResponse<RolePermissionsDto>> {
    return apiClient.get<never, ApiResponse<RolePermissionsDto>>('/roles/permissions');
  },

  /**
   * Update role permissions (Admin restricted)
   * PUT /api/v1/roles/permissions
   */
  async updateRolePermissions(payload: RolePermissionsDto): Promise<ApiResponse<RolePermissionsDto>> {
    return apiClient.put<never, ApiResponse<RolePermissionsDto>>('/roles/permissions', payload);
  },
};

export default usersApi;
