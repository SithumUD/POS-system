// Standard API Envelopes
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  errorCode?: string;
}

export interface PageResponse<T> {
  content: T[];
  pageable?: {
    pageNumber: number;
    pageSize: number;
    sort?: {
      sorted: boolean;
      empty: boolean;
      unsorted: boolean;
    };
  };
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty?: boolean;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errorCode?: string;
  timestamp: string;
}

// ----------------------------------------------------------------------
// 1. Auth & User Administration
// ----------------------------------------------------------------------

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'CASHIER' | 'VIEWER';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'INVITED';

export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  branchSlug: string | null;
  branchName?: string | null;
  avatarUrl?: string | null;
  lastActiveAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: UserDto;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password?: string;
  role: Role;
  status?: UserStatus;
  branchSlug?: string | null;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: Role;
  branchSlug?: string | null;
}

export interface UserQueryParams {
  role?: Role;
  status?: UserStatus;
  branchSlug?: string;
  search?: string;
  page?: number;
  size?: number;
}

export type PermissionKey = 'pos' | 'refunds' | 'products' | 'purchasing' | 'reports' | 'settings';
export type RolePermissionsDto = Record<Role, Record<PermissionKey, boolean>>;

// ----------------------------------------------------------------------
// 1.5 Super Admin & Tenant Management
// ----------------------------------------------------------------------

export type TenantStatus = 'INVITED' | 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED';
export type PlanType = 'STARTER' | 'BUSINESS' | 'PROFESSIONAL' | 'ENTERPRISE';

export interface TenantSummaryDto {
  id: string;
  name: string;
  contactEmail: string;
  businessPhone?: string;
  businessAddress?: string;
  plan: PlanType;
  status: TenantStatus;
  maxUsers: number;
  maxBranches: number;
  maxProducts: number;
  createdAt: string;
}

export interface InviteBusinessRequest {
  email: string;
  plan: PlanType;
}

export interface UpdateTenantPlanRequest {
  plan: PlanType;
  maxBranches?: number;
  maxUsers?: number;
  maxProducts?: number;
}

export interface SignupInviteDetailsDto {
  contactEmail: string;
  plan: PlanType;
  maxUsers: number;
  maxBranches: number;
  maxProducts: number;
}

export interface TenantSignupRequest {
  signupToken: string;
  businessName: string;
  businessAddress?: string;
  businessPhone?: string;
  adminName: string;
  adminEmail: string;
  adminPassword?: string;
}


// ----------------------------------------------------------------------
// 2. Categories & Products
// ----------------------------------------------------------------------

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryTreeDto extends CategoryDto {
  children?: CategoryTreeDto[];
}

export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  parentId?: string | null;
  description?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  parentId?: string | null;
  description?: string;
}

export type UnitOfMeasure = 'EACH' | 'PCS' | 'BOTTLE' | 'PACK' | 'PACKET' | 'BOX' | 'KG' | 'G' | 'L' | 'ML' | 'DOZEN';

export interface ProductDto {
  id: string;
  sku: string;
  barcode: string | null;
  name: string;
  categorySlug: string | null;
  categoryName?: string | null;
  unitPrice: number;
  costPrice: number;
  taxRate: number;
  reorderThreshold?: number;
  unitOfMeasure: UnitOfMeasure | string;
  active: boolean;
  imageUrl: string | null;
  preferredSupplierId?: string | null;
  preferredSupplierName?: string | null;
  stockDistribution?: Record<string, number>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductQueryParams {
  page?: number;
  size?: number;
  search?: string;
  categorySlug?: string;
  active?: boolean;
  activeOnly?: boolean;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface CreateProductRequest {
  sku: string;
  barcode?: string | null;
  name: string;
  categoryId?: string | null;
  categorySlug?: string | null;
  price?: number;
  unitPrice?: number;
  cost?: number;
  costPrice?: number;
  taxRate?: number;
  threshold?: number;
  reorderThreshold?: number;
  unitOfMeasure?: UnitOfMeasure | string;
  unit?: string;
  active?: boolean;
  imageUrl?: string | null;
  supplierId?: string | null;
  preferredSupplierId?: string | null;
  supplierIds?: string[];
  initialStock?: Record<string, number>;
}

export interface UpdateProductRequest {
  sku?: string;
  barcode?: string | null;
  name?: string;
  categoryId?: string | null;
  categorySlug?: string | null;
  price?: number;
  unitPrice?: number;
  cost?: number;
  costPrice?: number;
  taxRate?: number;
  threshold?: number;
  reorderThreshold?: number;
  unitOfMeasure?: UnitOfMeasure | string;
  unit?: string;
  active?: boolean;
  imageUrl?: string | null;
  supplierId?: string | null;
  preferredSupplierId?: string | null;
  supplierIds?: string[];
}

// ----------------------------------------------------------------------
// 3. POS Terminal & Checkout
// ----------------------------------------------------------------------

export interface PosProductDto extends ProductDto {
  quantityOnHand: number;
}

export type PaymentMethod = 'CASH' | 'CARD' | 'SPLIT';
export type SaleStatus = 'COMPLETED' | 'VOIDED' | 'REFUNDED';

export interface CheckoutItemRequest {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  lineTotal: number;
}

export interface PaymentLegRequest {
  method: PaymentMethod;
  amount: number;
  tenderedAmount?: number;
}

export interface CheckoutRequest {
  branchSlug: string;
  registerId: string;
  idempotencyKey: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  items: CheckoutItemRequest[];
  payments: PaymentLegRequest[];
  customerName?: string;
  note?: string;
}

export interface SyncBatchResponse {
  syncedCount: number;
  sales: SaleDto[];
}

export interface HeldSaleItemDto {
  id?: string;
  productId: string;
  productNameSnapshot: string;
  productSkuSnapshot?: string | null;
  unitPrice: number;
  quantity: number;
}

export interface HeldSaleDto {
  id: string;
  branchSlug?: string;
  cashierName?: string;
  customerName?: string;
  label?: string;
  note?: string;
  discount?: number;
  heldAt: string;
  items: HeldSaleItemDto[];
}

export interface ParkCartRequest {
  branchSlug: string;
  customerName?: string;
  note?: string;
  items: CheckoutItemRequest[];
}

// ----------------------------------------------------------------------
// 4. Sales Ledger & Receipts
// ----------------------------------------------------------------------

export interface SaleDto {
  id: string;
  receiptNumber: string;
  branchSlug: string;
  branchName: string;
  cashierId: string;
  cashierName: string;
  registerId?: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: SaleStatus;
  soldAt?: string;
  createdAt: string;
  items: CheckoutItemRequest[];
  payments: PaymentLegRequest[];
  note?: string | null;
}

export interface SaleFilterParams {
  branchSlug?: string;
  status?: SaleStatus;
  startDate?: string;
  endDate?: string;
  cashierId?: string;
  paymentMethod?: PaymentMethod;
  search?: string;
  page?: number;
  size?: number;
}

export interface VoidSaleRequest {
  reason: string;
}

export interface RefundItemRequest {
  productId: string;
  quantity: number;
}

export interface RefundSaleRequest {
  reason: string;
  refundAmount: number;
  itemQuantities?: Record<string, number>;
}

// ----------------------------------------------------------------------
// 5. Inventory & Stock
// ----------------------------------------------------------------------

export type StockAdjustmentType = 'ADD' | 'REMOVE' | 'CORRECTION';
export type StockMovementType = 'SALE' | 'PURCHASE' | 'ADJUSTMENT' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'VOID' | 'RETURN';
export type TransferStatus = 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';

export interface BranchStockDto {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  branchSlug: string;
  branchName: string;
  quantityOnHand: number;
  reorderThreshold: number;
  updatedAt: string;
}

export interface BranchStockQueryParams {
  branchSlug: string;
  lowStockOnly?: boolean;
  search?: string;
  page?: number;
  size?: number;
}

export interface StockAdjustmentRequest {
  branchSlug: string;
  productId: string;
  action?: StockAdjustmentType;
  adjustmentType?: StockAdjustmentType;
  quantity: number;
  reason: string;
  note?: string;
}

export interface StockMovementDto {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  branchSlug: string;
  branchName: string;
  type: StockMovementType;
  quantity: number;
  referenceId?: string | null;
  note?: string | null;
  createdByName?: string | null;
  createdAt: string;
}

export interface MovementQueryParams {
  branchSlug?: string;
  type?: StockMovementType;
  productId?: string;
  page?: number;
  size?: number;
}

export interface StockTransferItemDto {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  quantity: number;
}

export interface StockTransferDto {
  id: string;
  transferNumber: string;
  sourceBranchSlug: string;
  sourceBranchName: string;
  targetBranchSlug: string;
  targetBranchName: string;
  status: TransferStatus;
  note?: string | null;
  createdByName?: string | null;
  createdAt: string;
  completedAt?: string | null;
  items: StockTransferItemDto[];
}

export interface CreateTransferItemRequest {
  productId: string;
  quantity: number;
}

export interface CreateTransferRequest {
  fromBranchSlug: string;
  toBranchSlug: string;
  note?: string;
  items: CreateTransferItemRequest[];
}

export interface TransferQueryParams {
  branchSlug?: string;
  status?: TransferStatus;
  page?: number;
  size?: number;
}

// ----------------------------------------------------------------------
// 6. Suppliers & Purchasing
// ----------------------------------------------------------------------

export type SupplierStatus = 'ACTIVE' | 'ON_HOLD' | 'INACTIVE';
export type PaymentTerms = 'NET_7' | 'NET_15' | 'NET_30' | 'NET_45' | 'CASH_ON_DELIVERY';

export interface SupplierDto {
  id: string;
  name: string;
  contactPerson?: string | null;
  contactEmail?: string | null;
  phone?: string | null;
  address?: string | null;
  paymentTerms?: PaymentTerms | null;
  leadTimeDays?: number | null;
  suppliedCategories?: string[];
  status: SupplierStatus;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplierQueryParams {
  search?: string;
  status?: SupplierStatus;
  page?: number;
  size?: number;
}

export interface CreateSupplierRequest {
  name: string;
  contactPerson?: string;
  contactEmail?: string;
  phone?: string;
  address?: string;
  paymentTerms?: PaymentTerms;
  leadTimeDays?: number;
  suppliedCategories?: string[];
  status?: SupplierStatus;
  notes?: string;
}

export interface UpdateSupplierRequest {
  name?: string;
  contactPerson?: string;
  contactEmail?: string;
  phone?: string;
  address?: string;
  paymentTerms?: PaymentTerms;
  leadTimeDays?: number;
  suppliedCategories?: string[];
  status?: SupplierStatus;
  notes?: string;
}

export type PurchaseOrderStatus = 'DRAFT' | 'SENT' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CLOSED' | 'CANCELLED';

export interface PurchaseOrderItemDto {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  lineTotal?: number;
}

export interface PurchaseOrderEventDto {
  id: string;
  description: string;
  actorName?: string | null;
  occurredAt: string;
}

export interface PurchaseOrderDto {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  branchSlug: string;
  branchName: string;
  status: PurchaseOrderStatus;
  createdByName?: string | null;
  expectedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  items: PurchaseOrderItemDto[];
  events: PurchaseOrderEventDto[];
}

export interface PoQueryParams {
  branchSlug?: string;
  supplierId?: string;
  status?: PurchaseOrderStatus;
  page?: number;
  size?: number;
}

export interface CreatePoItemRequest {
  productId: string;
  quantityOrdered: number;
  unitCost: number;
}

export interface CreatePoRequest {
  supplierId: string;
  branchSlug: string;
  expectedAt?: string;
  notes?: string;
  status?: PurchaseOrderStatus;
  items: CreatePoItemRequest[];
}

export interface ReceivePoRequest {
  itemQuantities: Record<string, number>;
  notes?: string;
}

// ----------------------------------------------------------------------
// 7. Analytics & Financial Reports
// ----------------------------------------------------------------------

export interface SalesSummaryDto {
  grossRevenue: number;
  netRevenue: number;
  totalTransactions: number;
  averageBasketValue: number;
  totalItemsSold: number;
  totalDiscounts: number;
  totalTax: number;
}

export type RevenueSeriesInterval = 'HOURLY' | 'DAILY';

export interface RevenueDataPoint {
  timestamp: string;
  revenue: number;
  transactionCount: number;
}

export interface RevenueSeriesDto {
  interval: RevenueSeriesInterval;
  series: RevenueDataPoint[];
}

export interface CategoryBreakdownItem {
  categorySlug: string;
  categoryName: string;
  revenue: number;
  itemsSold: number;
  percentageShare: number;
}

export type CategoryBreakdownDto = CategoryBreakdownItem[];

export interface PnLDto {
  grossSales: number;
  discounts: number;
  netRevenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  operatingOverhead: number;
  netProfit: number;
  grossMarginPercent: number;
  netMarginPercent: number;
}

export interface BranchProfitabilityItem {
  branchSlug: string;
  branchName: string;
  grossRevenue: number;
  netProfit: number;
  stockAssetValuation: number;
  activeTerminalCount: number;
}

export type BranchProfitabilityDto = BranchProfitabilityItem[];

export interface CashFlowDto {
  cashPayments: number;
  cardPayments: number;
  splitPayments: number;
  totalTendered: number;
  totalChangeGiven: number;
}

export interface ProductMarginDto {
  productId: string;
  sku: string;
  name: string;
  costPrice: number;
  unitPrice: number;
  marginAmount: number;
  marginPercent: number;
}

export interface AskDataRequest {
  query: string;
  branchSlug?: string;
}

export interface AskDataResponse {
  summaryText: string;
  metricsPayload: Record<string, unknown>;
  recommendations: string[];
}

// ----------------------------------------------------------------------
// 8. Anomaly Security & Fraud Alerts
// ----------------------------------------------------------------------

export type AnomalySeverity = 'HIGH' | 'MEDIUM' | 'LOW';
export type AnomalyStatus = 'NEW' | 'INVESTIGATING' | 'REVIEWED' | 'DISMISSED';
export type AnomalyType = 'ELEVATED_VOIDS' | 'LIMIT_HUGGING_DISCOUNTS' | 'STOCK_WRITE_OFFS' | 'ZERO_STOCK_FAST_MOVERS';

export interface AlertNoteDto {
  id: string;
  text: string;
  authorName: string;
  createdAt: string;
}

export interface AnomalyAlertDto {
  id: string;
  branchSlug: string;
  branchName: string;
  relatedUserName?: string | null;
  title: string;
  explanation: string;
  severity: AnomalySeverity;
  status: AnomalyStatus;
  type: AnomalyType;
  windowDescription: string;
  relatedEntityLabel: string;
  metricDescription: string;
  createdAt: string;
  notes: AlertNoteDto[];
}

export interface AlertFilterParams {
  branchSlug?: string;
  severity?: AnomalySeverity;
  status?: AnomalyStatus;
  type?: AnomalyType;
  page?: number;
  size?: number;
}

export interface AddAlertNoteRequest {
  note: string;
}

// ----------------------------------------------------------------------
// 9. Store Branches
// ----------------------------------------------------------------------

export type BranchStatus = 'OPEN' | 'CLOSED' | 'SETUP';

export interface BranchDto {
  id: string;
  slug: string;
  name: string;
  shortName: string | null;
  address: string | null;
  phone: string | null;
  managerId?: string | null;
  managerName?: string | null;
  opensAt: string | null;
  closesAt: string | null;
  terminalCount: number;
  status: BranchStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface BranchQueryParams {
  status?: BranchStatus;
  search?: string;
  page?: number;
  size?: number;
}

export interface CreateBranchRequest {
  name: string;
  shortName?: string;
  slug?: string;
  address?: string;
  phone?: string;
  managerId?: string;
  opensAt?: string;
  closesAt?: string;
  terminalCount?: number;
  status?: BranchStatus;
}

export interface UpdateBranchRequest {
  name?: string;
  shortName?: string | null;
  address?: string | null;
  phone?: string | null;
  managerId?: string | null;
  opensAt?: string | null;
  closesAt?: string | null;
  terminalCount?: number;
  status?: BranchStatus;
}

// ----------------------------------------------------------------------
// 10. Store Settings
// ----------------------------------------------------------------------

export type AlertSensitivity = 'LOW' | 'BALANCED' | 'HIGH';

export interface StoreSettingsDto {
  storeName: string;
  legalName: string;
  currency: string;
  taxRate: number;
  taxLabel: string;
  receiptFooter: string;
  autoPrintReceipt: boolean;
  roundCashTo: number;
  timezone: string;
  lowStockThreshold: number;
  allowNegativeStock: boolean;
  maxDiscountPercent: number;
  requireManagerApproval: boolean;
  emailAlerts: boolean;
  alertSensitivity: AlertSensitivity;
  sessionTimeoutMinutes: number;
  twoFactorEnabled: boolean;
}

export interface UpdateSettingsRequest {
  storeName?: string;
  legalName?: string;
  currency?: string;
  taxRate?: number;
  taxLabel?: string;
  receiptFooter?: string;
  autoPrintReceipt?: boolean;
  roundCashTo?: number;
  timezone?: string;
  lowStockThreshold?: number;
  allowNegativeStock?: boolean;
  maxDiscountPercent?: number;
  requireManagerApproval?: boolean;
  emailAlerts?: boolean;
  alertSensitivity?: AlertSensitivity;
  sessionTimeoutMinutes?: number;
  twoFactorEnabled?: boolean;
}
