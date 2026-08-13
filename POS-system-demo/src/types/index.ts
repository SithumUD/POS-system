export type UUID = string;
export type ISOString = string;

export interface BaseResource {
  id: UUID;
  createdAt: ISOString;
  updatedAt: ISOString;
}

/* --------------------------------------------------------------------- Summaries */

export interface BranchSummary {
  id: UUID;
  slug: string;
  name: string;
}

export interface UserSummary {
  id: UUID;
  name: string;
  email?: string;
  role?: string;
}

export interface ProductSummary {
  id: UUID;
  sku: string;
  name: string;
}

export interface CategorySummary {
  id: UUID;
  name: string;
  slug: string | null;
}

export interface SupplierSummary {
  id: UUID;
  name: string;
}

/* ------------------------------------------------------------------------- Enums */

export type BranchStatus = 'OPEN' | 'CLOSED' | 'SETUP';
export type SupplierStatus = 'ACTIVE' | 'ON_HOLD' | 'INACTIVE';
export type PaymentTerms = 'NET_7' | 'NET_15' | 'NET_30' | 'NET_45' | 'CASH_ON_DELIVERY';
export type PurchaseOrderStatus = 'DRAFT' | 'SENT' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CLOSED' | 'CANCELLED';
export type PoStatus = PurchaseOrderStatus;
export type SaleStatus = 'COMPLETED' | 'VOIDED' | 'REFUNDED';
export type PaymentMethod = 'CASH' | 'CARD' | 'SPLIT';
export type StockMovementType = 'SALE' | 'PURCHASE' | 'ADJUSTMENT' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'VOID' | 'RETURN';
export type MovementType = StockMovementType;
export type TransferStatus = 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
export type AnomalySeverity = 'HIGH' | 'MEDIUM' | 'LOW';
export type Severity = AnomalySeverity;
export type AnomalyStatus = 'NEW' | 'INVESTIGATING' | 'REVIEWED' | 'DISMISSED';
export type AlertStatus = AnomalyStatus;
export type Role = 'ADMIN' | 'MANAGER' | 'CASHIER' | 'VIEWER';
export type UserRole = Role;
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'INVITED';
export type UnitOfMeasure = 'EACH' | 'PCS' | 'BOTTLE' | 'PACK' | 'BOX' | 'KG' | 'G' | 'L' | 'ML' | 'DOZEN';
export type AlertSensitivity = 'LOW' | 'BALANCED' | 'HIGH';

export type CategoryName =
  | 'Beverages'
  | 'Snacks'
  | 'Dairy'
  | 'Household'
  | 'Bakery'
  | 'Frozen'
  | 'Personal Care'
  | 'Stationery'
  | 'Electronics';

export type BranchId = string;
export type StockState = 'in-stock' | 'low-stock' | 'out-of-stock';

/* --------------------------------------------------------------------- Entities */

export interface Branch extends BaseResource {
  slug: string;
  name: string;
  shortName: string | null;
  address: string | null;
  phone: string | null;
  manager: UserSummary | null;
  opensAt: string | null;
  closesAt: string | null;
  terminalCount: number;
  status: BranchStatus;
  // Computed UI fields & aliases
  todaySales: number;
  weekSales: number;
  staff: number;
  short?: string;
}

export interface Product extends BaseResource {
  sku: string;
  barcode: string | null;
  name: string;
  category: CategorySummary | null;
  unitPrice: number;
  costPrice: number;
  taxRate: number;
  reorderThreshold: number;
  unitOfMeasure: UnitOfMeasure;
  unitLabel: string | null;
  imageUrl: string | null;
  preferredSupplier: SupplierSummary | null;
  suppliers?: SupplierSummary[];
  active: boolean;
  // UI Stock distribution map across branches
  stock: Record<BranchId, number>;
  // Legacy aliases
  price?: number;
  cost?: number;
  threshold?: number;
  unit?: string;
  supplier?: string;
}

export interface ProductStock extends BaseResource {
  product: ProductSummary;
  branch: BranchSummary;
  quantityOnHand: number;
}

export interface CartLine {
  productId: string;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
}

export interface SaleItem extends BaseResource {
  product: ProductSummary;
  productNameSnapshot: string;
  productSkuSnapshot: string | null;
  quantity: number;
  unitPriceAtSale: number;
  discount: number;
  lineTotal: number;
  // Aliases
  productId?: string;
  name?: string;
  sku?: string;
  unitPrice?: number;
}

export interface Payment extends BaseResource {
  method: PaymentMethod;
  amount: number;
  tenderedAmount: number | null;
}

export interface Sale extends BaseResource {
  receiptNumber: string;
  branch: BranchId | BranchSummary;
  cashier: string | UserSummary;
  terminalId: string | null;
  status: SaleStatus;
  soldAt: ISOString;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  note: string | null;
  idempotencyKey?: string | null;
  items: SaleItem[];
  payments: Payment[];
  // Legacy / fallback line alias for cart items display
  lines: CartLine[];
  tendered?: number;
  payment?: PaymentMethod; // primary payment method helper
  at?: ISOString; // alias for soldAt / createdAt
}

export interface HeldSaleItem extends BaseResource {
  product: ProductSummary;
  productNameSnapshot: string;
  productSkuSnapshot: string | null;
  unitPrice: number;
  quantity: number;
}

export interface HeldSale {
  id: string;
  branch?: BranchSummary;
  cashier?: UserSummary;
  terminalId?: string | null;
  label: string;
  discount: number;
  heldAt: ISOString;
  items: HeldSaleItem[];
  lines: CartLine[];
}

export interface StockMovement extends BaseResource {
  product: ProductSummary | string;
  productId: string;
  branch: BranchId | BranchSummary;
  type: StockMovementType;
  quantity: number;
  qty: number; // alias for quantity
  referenceId: string | null;
  reference: string; // alias for referenceId
  note: string | null;
  createdBy?: UserSummary | null;
  at?: ISOString; // alias for createdAt
}

export interface Supplier extends BaseResource {
  name: string;
  contactPerson: string | null;
  phone: string | null;
  contactEmail: string | null;
  address: string | null;
  paymentTerms: PaymentTerms | null;
  leadTimeDays: number | null;
  suppliedCategories: string[];
  status: SupplierStatus;
  notes: string | null;
  // Aliases for compatibility
  contact?: string;
  contactPhone?: string;
  email?: string;
  categories?: CategoryName[];
}

export interface PurchaseOrderItem extends BaseResource {
  product: ProductSummary;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  // Aliases
  productId?: string;
  name?: string;
  sku?: string;
  ordered?: number;
  received?: number;
  productNameSnapshot?: string;
  lineTotal?: number;
}

export type PoLine = PurchaseOrderItem;

export interface PurchaseOrderEvent extends BaseResource {
  description: string;
  occurredAt: ISOString;
  actor: UserSummary | string | null;
  // Aliases
  text?: string;
  at?: string;
  actorName?: string;
}

export type PoEvent = PurchaseOrderEvent;

export interface PurchaseOrder extends BaseResource {
  poNumber: string;
  supplier: SupplierSummary | string;
  supplierId: string;
  branch: BranchId | BranchSummary;
  status: PurchaseOrderStatus;
  createdBy?: UserSummary | null;
  expectedAt: ISOString | null;
  notes: string | null;
  items: PurchaseOrderItem[];
  events: PurchaseOrderEvent[];
  // Aliases
  lines: PoLine[];
  activity: PoEvent[];
  supplierName?: string;
  branchSlug?: string;
  branchName?: string;
}

export interface PoDraftLine {
  productId: string;
  ordered: number;
  unitCost: number;
}

export interface PoInput {
  supplierId: string;
  branch: BranchId;
  expectedAt: string;
  notes: string;
  lines: PoDraftLine[];
}

export interface StockTransferItem extends BaseResource {
  product: ProductSummary;
  productNameSnapshot: string;
  productSkuSnapshot: string | null;
  quantity: number;
  // Aliases
  productId?: string;
  name?: string;
  sku?: string;
  qty?: number;
}

export type TransferLine = StockTransferItem;

export interface StockTransfer extends BaseResource {
  transferNumber: string;
  fromBranch: BranchSummary | BranchId;
  toBranch: BranchSummary | BranchId;
  status: TransferStatus;
  note: string | null;
  completedAt?: ISOString | null;
  createdBy?: UserSummary | null;
  items: StockTransferItem[];
  // Aliases
  from: BranchId;
  to: BranchId;
  lines: TransferLine[];
  fromBranchSlug?: string;
  toBranchSlug?: string;
}

export type Transfer = StockTransfer;

export interface AlertNote extends BaseResource {
  text: string;
  author: UserSummary | string;
  at?: ISOString;
}

export interface AnomalyAlert extends BaseResource {
  branch: BranchSummary | string;
  relatedUser?: UserSummary | null;
  title: string;
  explanation: string;
  severity: AnomalySeverity;
  status: AnomalyStatus;
  windowDescription: string;
  relatedEntityLabel: string;
  metricDescription: string;
  notes: AlertNote[];
  // Aliases for compatibility
  window?: string;
  related?: string;
  metric?: string;
  at?: ISOString;
}

export interface User extends BaseResource {
  name: string;
  email: string;
  role: Role;
  branch: BranchSummary | string | null;
  status: UserStatus;
  lastActiveAt: ISOString | null;
  // Aliases
  lastActive?: string;
  fullName?: string;
  username?: string;
  assignedBranch?: BranchSummary | string | null;
}

export type PermissionKey =
  | 'pos'
  | 'refunds'
  | 'products'
  | 'purchasing'
  | 'reports'
  | 'settings';

export type RolePermissions = Record<Role, Record<PermissionKey, boolean>>;

export interface StoreSettings {
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
  // Alias for compatibility
  twoFactor?: boolean;
}