import {
  AnomalyAlert,
  Branch,
  CartLine,
  HeldSale,
  MovementType,
  PaymentMethod,
  PoInput,
  PoStatus,
  Product,
  PurchaseOrder,
  RolePermissions,
  Sale,
  StockMovement,
  StoreSettings,
  Supplier,
  Transfer,
  User,
  UserRole,
  AlertStatus,
  PermissionKey,
  BranchId
} from '../types';
import { CategoryDto, CategoryTreeDto } from '../api/types';
import { TAX_RATE } from '../data/products';
import { rolePermissions, storeSettings } from '../data/operations';

export interface Totals {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  itemCount: number;
}

export function computeTotals(lines: CartLine[], discount: number, rate = TAX_RATE): Totals {
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const cappedDiscount = Math.min(discount, subtotal);
  const taxable = Math.max(subtotal - cappedDiscount, 0);
  const tax = Math.round(taxable * rate * 100) / 100;
  return {
    subtotal,
    discount: cappedDiscount,
    tax,
    total: Math.round((taxable + tax) * 100) / 100,
    itemCount: lines.reduce((sum, l) => sum + l.quantity, 0)
  };
}

export interface AdjustmentInput {
  productId: string;
  branchId: BranchId;
  type: 'Add' | 'Remove' | 'Correction';
  quantity: number;
  reason: string;
  note: string;
}

export type SupplierInput = Omit<Supplier, 'id' | 'createdAt'>;
export type BranchInput = Omit<Branch, 'id' | 'todaySales' | 'weekSales' | 'createdAt' | 'updatedAt'>;
export type UserInput = Omit<User, 'id' | 'createdAt' | 'lastActive' | 'lastActiveAt' | 'updatedAt'>;

export interface TransferInput {
  from: BranchId;
  to: BranchId;
  note: string;
  lines: { productId: string; qty: number }[];
}

export interface State {
  products: Product[];
  categories: CategoryDto[];
  categoryTree: CategoryTreeDto[];
  sales: Sale[];
  movements: StockMovement[];
  cart: CartLine[];
  discount: number;
  payment: PaymentMethod;
  held: HeldSale[];
  branch: BranchId;
  online: boolean;
  queued: number;
  queuedSales: Sale[];
  lastSale: Sale | null;
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  transfers: Transfer[];
  alerts: AnomalyAlert[];
  users: User[];
  branches: Branch[];
  permissions: RolePermissions;
  settings: StoreSettings;
  saleSeq: number;
  adjSeq: number;
  productSeq: number;
  poSeq: number;
  supplierSeq: number;
  transferSeq: number;
  userSeq: number;
  branchSeq: number;
}

export type StoreState = State;

export type Action =
  | { type: 'SET_BRANCH'; branch: BranchId }
  | { type: 'ADD_TO_CART'; product: Product; quantity: number }
  | { type: 'SET_LINE_QTY'; productId: string; quantity: number }
  | { type: 'REMOVE_LINE'; productId: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_DISCOUNT'; discount: number }
  | { type: 'SET_PAYMENT'; payment: PaymentMethod }
  | { type: 'HOLD_SALE' }
  | { type: 'RESUME_HELD'; id: string }
  | { type: 'DISCARD_HELD'; id: string }
  | { type: 'COMPLETE_SALE'; tendered?: number; payload?: Sale }
  | { type: 'CLEAR_LAST_SALE' }
  | { type: 'ADJUST_STOCK'; input: AdjustmentInput }
  | { type: 'SAVE_PRODUCT'; product: Product }
  | { type: 'CREATE_PRODUCT'; product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'DUPLICATE_PRODUCT'; id: string }
  | { type: 'TOGGLE_ACTIVE'; id: string }
  | { type: 'DELETE_PRODUCT'; id: string }
  | { type: 'TOGGLE_ONLINE' }
  | { type: 'CREATE_PO'; input: PoInput; send: boolean }
  | { type: 'UPDATE_PO'; id: string; input: PoInput }
  | { type: 'SET_PO_STATUS'; id: string; status: PoStatus }
  | { type: 'RECEIVE_PO'; id: string; receipts: Record<string, number>; note: string }
  | { type: 'DELETE_PO'; id: string }
  | { type: 'CREATE_SUPPLIER'; input: SupplierInput }
  | { type: 'UPDATE_SUPPLIER'; id: string; input: SupplierInput }
  | { type: 'DELETE_SUPPLIER'; id: string }
  | { type: 'VOID_SALE'; id: string; reason: string }
  | { type: 'REFUND_SALE'; id: string; reason: string }
  | { type: 'CREATE_TRANSFER'; input: TransferInput }
  | { type: 'COMPLETE_TRANSFER'; id: string }
  | { type: 'CANCEL_TRANSFER'; id: string }
  | { type: 'CREATE_BRANCH'; input: BranchInput }
  | { type: 'UPDATE_BRANCH'; id: BranchId; patch: Partial<Branch> }
  | { type: 'DELETE_BRANCH'; id: BranchId }
  | { type: 'CREATE_USER'; input: UserInput }
  | { type: 'UPDATE_USER'; id: string; patch: Partial<User> }
  | { type: 'DELETE_USER'; id: string }
  | { type: 'SET_PERMISSION'; role: UserRole; key: PermissionKey; value: boolean }
  | { type: 'UPDATE_SETTINGS'; patch: Partial<StoreSettings> }
  | { type: 'SET_ALERT_STATUS'; id: string; status: AlertStatus }
  | { type: 'ADD_ALERT_NOTE'; id: string; text: string }
  | { type: 'RUN_ANOMALY_SCAN' }
  | { type: 'SET_PRODUCTS'; products: Product[] }
  | { type: 'SET_CATEGORIES'; categories: CategoryDto[] }
  | { type: 'SET_CATEGORY_TREE'; categoryTree: CategoryTreeDto[] }
  | { type: 'SET_SALES'; sales: Sale[] }
  | { type: 'SET_MOVEMENTS'; movements: StockMovement[] }
  | { type: 'SET_SUPPLIERS'; suppliers: Supplier[] }
  | { type: 'SET_PURCHASE_ORDERS'; purchaseOrders: PurchaseOrder[] }
  | { type: 'SET_TRANSFERS'; transfers: Transfer[] }
  | { type: 'SET_ALERTS'; alerts: AnomalyAlert[] }
  | { type: 'SET_USERS'; users: User[] }
  | { type: 'SET_BRANCHES'; branches: Branch[] }
  | { type: 'SET_SETTINGS'; settings: StoreSettings }
  | { type: 'SET_PERMISSIONS'; permissions: RolePermissions };

export type PosAction = Action;

export const initialState: State = {
  products: [],
  categories: [],
  categoryTree: [],
  sales: [],
  movements: [],
  cart: [],
  discount: 0,
  payment: 'CASH',
  held: [],
  branch: 'colombo',
  online: true,
  queued: 0,
  queuedSales: [],
  lastSale: null,
  suppliers: [],
  purchaseOrders: [],
  transfers: [],
  alerts: [],
  users: [],
  branches: [],
  permissions: rolePermissions,
  settings: storeSettings,
  saleSeq: 1,
  adjSeq: 1,
  productSeq: 1,
  poSeq: 1,
  supplierSeq: 1,
  transferSeq: 1,
  userSeq: 1,
  branchSeq: 1
};

export function pad(n: number, size = 4): string {
  return String(n).padStart(size, '0');
}

export function stockAt(product: Product, branch: BranchId): number {
  return product.stock?.[branch] ?? 0;
}

export function applyStock(
  products: Product[],
  productId: string,
  branch: BranchId,
  delta: number,
  at: string
): Product[] {
  return products.map((product) =>
    product.id === productId
      ? {
          ...product,
          stock: {
            ...product.stock,
            [branch]: Math.max(stockAt(product, branch) + delta, 0)
          },
          updatedAt: at
        }
      : product
  );
}

let movementSeq = 0;

export function movement(
  seq: number,
  productId: string,
  branch: BranchId,
  type: MovementType,
  quantity: number,
  reference: string,
  note: string,
  at: string
): StockMovement {
  movementSeq += 1;
  return {
    id: `mv-${seq}-${movementSeq}-${productId}`,
    product: productId,
    productId,
    branch: { id: `branch-${branch}`, slug: branch, name: branch },
    type,
    quantity,
    qty: quantity,
    referenceId: reference,
    reference,
    note,
    createdAt: at,
    updatedAt: at
  };
}