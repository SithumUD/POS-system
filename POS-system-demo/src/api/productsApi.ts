import apiClient from './client';
import {
  ApiResponse,
  CategoryDto,
  CategoryTreeDto,
  CreateCategoryRequest,
  CreateProductRequest,
  PageResponse,
  ProductDto,
  ProductQueryParams,
  UpdateCategoryRequest,
  UpdateProductRequest,
} from './types';

/**
 * Products & Categories API Service
 * Endpoints: /api/v1/categories, /api/v1/products
 */
export const productsApi = {
  // --------------------------------------------------------------------
  // Category Endpoints
  // --------------------------------------------------------------------

  /**
   * Fetch flat list of all product categories
   * GET /api/v1/categories
   */
  async getCategories(): Promise<ApiResponse<CategoryDto[]>> {
    return apiClient.get<never, ApiResponse<CategoryDto[]>>('/categories');
  },

  /**
   * Fetch category hierarchy tree
   * GET /api/v1/categories/tree
   */
  async getCategoryTree(): Promise<ApiResponse<CategoryTreeDto[]>> {
    return apiClient.get<never, ApiResponse<CategoryTreeDto[]>>('/categories/tree');
  },

  /**
   * Create a new category
   * POST /api/v1/categories
   */
  async createCategory(payload: CreateCategoryRequest): Promise<ApiResponse<CategoryDto>> {
    return apiClient.post<never, ApiResponse<CategoryDto>>('/categories', payload);
  },

  /**
   * Update category details
   * PUT /api/v1/categories/{id}
   */
  async updateCategory(id: string, payload: UpdateCategoryRequest): Promise<ApiResponse<CategoryDto>> {
    return apiClient.put<never, ApiResponse<CategoryDto>>(`/categories/${id}`, payload);
  },

  /**
   * Delete category by ID
   * DELETE /api/v1/categories/{id}
   */
  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<never, ApiResponse<void>>(`/categories/${id}`);
  },

  // --------------------------------------------------------------------
  // Product Endpoints
  // --------------------------------------------------------------------

  /**
   * Fetch paginated list of product SKUs with filters
   * GET /api/v1/products
   */
  async getProducts(params?: ProductQueryParams): Promise<ApiResponse<PageResponse<ProductDto>>> {
    return apiClient.get<never, ApiResponse<PageResponse<ProductDto>>>('/products', { params });
  },

  /**
   * Fetch single product detail by UUID or SKU
   * GET /api/v1/products/{idOrSku}
   */
  async getProductByIdOrSku(idOrSku: string): Promise<ApiResponse<ProductDto>> {
    return apiClient.get<never, ApiResponse<ProductDto>>(`/products/${idOrSku}`);
  },

  /**
   * Create a new product SKU in catalogue
   * POST /api/v1/products
   */
  async createProduct(payload: CreateProductRequest): Promise<ApiResponse<ProductDto>> {
    return apiClient.post<never, ApiResponse<ProductDto>>('/products', payload);
  },

  /**
   * Update product details
   * PUT /api/v1/products/{id}
   */
  async updateProduct(id: string, payload: UpdateProductRequest): Promise<ApiResponse<ProductDto>> {
    return apiClient.put<never, ApiResponse<ProductDto>>(`/products/${id}`, payload);
  },

  /**
   * Toggle active/inactive status of a product
   * PATCH /api/v1/products/{id}/toggle-active
   */
  async toggleProductActive(id: string): Promise<ApiResponse<ProductDto>> {
    return apiClient.patch<never, ApiResponse<ProductDto>>(`/products/${id}/toggle-active`);
  },

  /**
   * Clone product into a draft template with new SKU
   * POST /api/v1/products/{id}/duplicate
   */
  async duplicateProduct(id: string): Promise<ApiResponse<ProductDto>> {
    return apiClient.post<never, ApiResponse<ProductDto>>(`/products/${id}/duplicate`);
  },

  /**
   * Soft-delete or archive product from catalogue
   * DELETE /api/v1/products/{id}
   */
  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<never, ApiResponse<void>>(`/products/${id}`);
  },
};

export default productsApi;
