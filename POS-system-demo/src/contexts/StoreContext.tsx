/**
 * DEMO MODE — StoreContext
 * All API calls removed. State is initialized from local dummy data files.
 * All mutations operate purely on the local reducer state.
 */
import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { toast } from 'sonner';
import {
  AlertStatus,
  Branch,
  BranchId,
  PermissionKey,
  PoInput,
  PoStatus,
  Product,
  UserRole,
  StoreSettings,
  User,
  Role,
  Supplier,
} from '../types';
import {
  Action,
  AdjustmentInput,
  BranchInput,
  computeTotals,
  initialState,
  State,
  stockAt,
  SupplierInput,
  Totals,
  TransferInput,
  UserInput,
} from './storeState';
import { posReducer } from './posReducer';
import { opsReducer } from './opsReducer';
import { useAuth } from './AuthContext';

// ─── Demo Data Imports ────────────────────────────────────────────────────────
import { seedProducts, categoryTree } from '../data/products';
import { branches as seedBranches } from '../data/branches';
import { seedSales } from '../data/sales';
import { suppliers as seedSuppliers, purchaseOrders as seedPOs } from '../data/purchasing';
import { seedMovements, anomalyAlerts, users as seedUsers, rolePermissions, storeSettings, seedTransfers } from '../data/operations';

export { computeTotals };
export type { Totals, AdjustmentInput, SupplierInput, BranchInput, UserInput, TransferInput };

function reducer(state: State, action: Action): State {
  const next = posReducer(state, action);
  if (next !== state) return next;
  return opsReducer(state, action);
}

interface StoreValue extends State {
  currentUserRole: Role;
  setCurrentUserRole: (role: Role) => void;
  totals: Totals;
  taxRate: number;
  setBranch: (branch: BranchId) => void;
  addToCart: (product: Product, quantity?: number) => boolean;
  setLineQty: (productId: string, quantity: number) => void;
  removeLine: (productId: string) => void;
  clearCart: () => void;
  setDiscount: (discount: number) => void;
  setPayment: (payment: State['payment']) => void;
  holdSale: () => void;
  resumeHeld: (id: string) => void;
  discardHeld: (id: string) => void;
  completeSale: (tendered?: number) => Promise<void>;
  clearLastSale: () => void;
  adjustStock: (input: AdjustmentInput) => Promise<void>;
  saveProduct: (product: Product) => Promise<void>;
  createProduct: (product: Omit<Product, 'id' | 'updatedAt'>) => Promise<void>;
  duplicateProduct: (id: string) => Promise<void>;
  toggleActive: (id: string) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  createCategory: (payload: { name: string; slug?: string; parentId?: string | null; description?: string }) => Promise<void>;
  updateCategory: (id: string, payload: { name?: string; slug?: string; parentId?: string | null; description?: string }) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  toggleOnline: () => void;
  availableStock: (productId: string) => number;
  inCartQty: (productId: string) => number;
  stockOf: (productId: string, branch: BranchId) => number;
  branchLabel: (branch: BranchId) => string;
  createPurchaseOrder: (input: PoInput, send: boolean) => Promise<void>;
  updatePurchaseOrder: (id: string, input: PoInput) => Promise<void>;
  setPoStatus: (id: string, status: PoStatus) => Promise<void>;
  receivePurchaseOrder: (id: string, receipts: Record<string, number>, note: string) => Promise<void>;
  deletePurchaseOrder: (id: string) => Promise<void>;
  createSupplier: (input: SupplierInput) => Promise<void>;
  updateSupplier: (id: string, input: SupplierInput) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  voidSale: (id: string, reason: string) => Promise<void>;
  refundSale: (id: string, reason: string, refundAmount?: number, itemQuantities?: Record<string, number>) => Promise<void>;
  createTransfer: (input: TransferInput) => Promise<void>;
  completeTransfer: (id: string) => Promise<void>;
  cancelTransfer: (id: string) => Promise<void>;
  createBranch: (input: BranchInput) => Promise<void>;
  updateBranch: (id: BranchId, patch: Partial<Branch>) => Promise<void>;
  deleteBranch: (id: BranchId) => Promise<void>;
  createUser: (input: UserInput) => Promise<void>;
  updateUser: (id: string, patch: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  setPermission: (role: UserRole, key: PermissionKey, value: boolean) => Promise<void>;
  updateSettings: (patch: Partial<StoreSettings>) => Promise<void>;
  setAlertStatus: (id: string, status: AlertStatus) => Promise<void>;
  addAlertNote: (id: string, text: string) => Promise<void>;
  runAnomalyScan: () => Promise<void>;
  refetchAll: () => Promise<void>;
}

const StoreContext = createContext<StoreValue | null>(null);

// Build initial demo state from seed data
const demoInitialState: State = {
  ...initialState,
  products: seedProducts,
  sales: seedSales,
  suppliers: seedSuppliers as unknown as Supplier[],
  purchaseOrders: seedPOs as unknown as any[],
  movements: seedMovements as unknown as any[],
  transfers: seedTransfers as unknown as any[],
  alerts: anomalyAlerts as unknown as any[],
  branches: seedBranches as unknown as Branch[],
  users: seedUsers as unknown as User[],
  permissions: rolePermissions,
  settings: storeSettings,
  categories: [
    { id: 'cat-beverages', name: 'Beverages', slug: 'beverages' },
    { id: 'cat-snacks', name: 'Snacks', slug: 'snacks' },
    { id: 'cat-dairy', name: 'Dairy', slug: 'dairy' },
    { id: 'cat-household', name: 'Household', slug: 'household' },
    { id: 'cat-bakery', name: 'Bakery', slug: 'bakery' },
    { id: 'cat-frozen', name: 'Frozen', slug: 'frozen' },
    { id: 'cat-personal-care', name: 'Personal Care', slug: 'personal-care' },
    { id: 'cat-stationery', name: 'Stationery', slug: 'stationery' },
    { id: 'cat-electronics', name: 'Electronics', slug: 'electronics' },
  ] as any,
  categoryTree: categoryTree as any,
  branch: 'colombo',
};

function demoSimulate(label: string): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 350 + Math.random() * 200));
}

let saleSeq = 10600;
let poSeq = 2060;
let adjSeq = 1000;
let tfrSeq = 350;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, demoInitialState);
  const { user, isAuthenticated } = useAuth();
  const [currentUserRole, setCurrentUserRole] = useState<Role>('ADMIN');

  useEffect(() => {
    if (user?.role) {
      setCurrentUserRole(user.role as Role);
    }
  }, [user]);

  const value = useMemo<StoreValue>(() => {
    const availableStock = (productId: string) => {
      const product = state.products.find((p) => p.id === productId);
      return product ? stockAt(product, state.branch) : 0;
    };
    const inCartQty = (productId: string) =>
      state.cart.find((l) => l.productId === productId)?.quantity ?? 0;

    return {
      ...state,
      currentUserRole,
      setCurrentUserRole,
      taxRate: (state.settings?.taxRate ?? 10) / 100,
      totals: computeTotals(state.cart, state.discount, (state.settings?.taxRate ?? 10) / 100),
      availableStock,
      inCartQty,
      stockOf: (productId, branch) => {
        const product = state.products.find((p) => p.id === productId);
        return product ? stockAt(product, branch) : 0;
      },
      branchLabel: (branch) => {
        const b = state.branches.find((b) => b.id === branch || b.slug === branch);
        return b?.shortName || (b as any)?.short || b?.name || branch;
      },
      setBranch: (branch) => dispatch({ type: 'SET_BRANCH', branch }),
      addToCart: (product, quantity = 1) => {
        const available = stockAt(product, state.branch);
        if (available <= 0 || inCartQty(product.id) + quantity > available) return false;
        dispatch({ type: 'ADD_TO_CART', product, quantity });
        return true;
      },
      setLineQty: (productId, quantity) => dispatch({ type: 'SET_LINE_QTY', productId, quantity }),
      removeLine: (productId) => dispatch({ type: 'REMOVE_LINE', productId }),
      clearCart: () => dispatch({ type: 'CLEAR_CART' }),
      setDiscount: (discount) => dispatch({ type: 'SET_DISCOUNT', discount }),
      setPayment: (payment) => dispatch({ type: 'SET_PAYMENT', payment }),
      holdSale: () => dispatch({ type: 'HOLD_SALE' }),
      resumeHeld: (id) => dispatch({ type: 'RESUME_HELD', id }),
      discardHeld: (id) => dispatch({ type: 'DISCARD_HELD', id }),
      completeSale: async (tendered) => {
        const totals = computeTotals(state.cart, state.discount, (state.settings?.taxRate ?? 10) / 100);
        const receiptNumber = `SALE-${saleSeq++}`;
        const now = new Date().toISOString();
        const branchRecord = state.branches.find((b) => b.slug === state.branch || b.id === state.branch);
        const branchSummary = branchRecord
          ? { id: branchRecord.id, slug: branchRecord.slug, name: branchRecord.name }
          : { id: state.branch, slug: state.branch, name: state.branch };

        const mockSalePayload: any = {
          id: `sale-demo-${Date.now()}`,
          receiptNumber,
          branch: branchSummary,
          cashier: { id: user?.id || 'u-1', name: user?.name || 'Demo Cashier', email: user?.email || '', role: currentUserRole },
          terminalId: 'terminal-1',
          status: 'COMPLETED',
          soldAt: now,
          subtotal: totals.subtotal,
          discount: totals.discount,
          tax: totals.tax,
          total: totals.total,
          note: null,
          items: state.cart.map((line, idx) => ({
            id: `item-demo-${idx}`,
            product: { id: line.productId, sku: line.sku, name: line.name },
            productNameSnapshot: line.name,
            productSkuSnapshot: line.sku,
            quantity: line.quantity,
            unitPriceAtSale: line.unitPrice,
            discount: 0,
            lineTotal: line.unitPrice * line.quantity,
            createdAt: now, updatedAt: now
          })),
          payments: [{
            id: `pay-demo-1`,
            method: state.payment,
            amount: totals.total,
            tenderedAmount: tendered ?? totals.total,
            createdAt: now, updatedAt: now
          }],
          lines: state.cart,
          createdAt: now, updatedAt: now
        };

        await demoSimulate('completeSale');
        toast.success(`Sale ${receiptNumber} completed — LKR ${totals.total.toFixed(2)}`);
        dispatch({ type: 'COMPLETE_SALE', tendered, payload: mockSalePayload });
      },
      clearLastSale: () => dispatch({ type: 'CLEAR_LAST_SALE' }),
      adjustStock: async (input) => {
        await demoSimulate('adjustStock');
        toast.success('Stock adjustment saved');
        dispatch({ type: 'ADJUST_STOCK', input });
      },
      saveProduct: async (product) => {
        await demoSimulate('saveProduct');
        toast.success('Product updated');
        dispatch({ type: 'SAVE_PRODUCT', product });
      },
      createProduct: async (product) => {
        await demoSimulate('createProduct');
        toast.success('Product created');
        dispatch({ type: 'CREATE_PRODUCT', product });
      },
      duplicateProduct: async (id) => {
        await demoSimulate('duplicateProduct');
        toast.success('Product duplicated as draft', { description: 'Status is set to Inactive until reviewed.' });
        dispatch({ type: 'DUPLICATE_PRODUCT', id });
      },
      toggleActive: async (id) => {
        await demoSimulate('toggleActive');
        const prod = state.products.find((p) => p.id === id);
        toast.success(`Product ${prod?.active ? 'deactivated' : 'activated'}`);
        dispatch({ type: 'TOGGLE_ACTIVE', id });
      },
      deleteProduct: async (id) => {
        await demoSimulate('deleteProduct');
        toast.success('Product deleted');
        dispatch({ type: 'DELETE_PRODUCT', id });
      },
      createCategory: async (payload) => {
        await demoSimulate('createCategory');
        toast.success(`Category '${payload.name}' created`);
      },
      updateCategory: async (_id, _payload) => {
        await demoSimulate('updateCategory');
        toast.success('Category updated');
      },
      deleteCategory: async (_id) => {
        await demoSimulate('deleteCategory');
        toast.success('Category deleted');
      },
      toggleOnline: () => dispatch({ type: 'TOGGLE_ONLINE' }),
      createPurchaseOrder: async (input, send) => {
        await demoSimulate('createPO');
        toast.success(send ? 'Purchase order sent to supplier' : 'Purchase order saved as draft');
        dispatch({ type: 'CREATE_PO', input, send });
      },
      updatePurchaseOrder: async (id, input) => {
        dispatch({ type: 'UPDATE_PO', id, input });
      },
      setPoStatus: async (id, status) => {
        await demoSimulate('setPoStatus');
        toast.success(`PO status updated to ${status}`);
        dispatch({ type: 'SET_PO_STATUS', id, status });
      },
      receivePurchaseOrder: async (id, receipts, note) => {
        await demoSimulate('receivePO');
        toast.success('Stock shipment received and inventory updated');
        dispatch({ type: 'RECEIVE_PO', id, receipts, note });
      },
      deletePurchaseOrder: async (id) => {
        dispatch({ type: 'DELETE_PO', id });
      },
      createSupplier: async (input) => {
        await demoSimulate('createSupplier');
        toast.success('Supplier created');
        dispatch({ type: 'CREATE_SUPPLIER', input });
      },
      updateSupplier: async (id, input) => {
        await demoSimulate('updateSupplier');
        toast.success('Supplier updated');
        dispatch({ type: 'UPDATE_SUPPLIER', id, input });
      },
      deleteSupplier: async (id) => {
        await demoSimulate('deleteSupplier');
        toast.success('Supplier deleted');
        dispatch({ type: 'DELETE_SUPPLIER', id });
      },
      voidSale: async (id, reason) => {
        await demoSimulate('voidSale');
        toast.success('Sale voided');
        dispatch({ type: 'VOID_SALE', id, reason });
      },
      refundSale: async (id, reason) => {
        await demoSimulate('refundSale');
        toast.success('Sale refunded');
        dispatch({ type: 'REFUND_SALE', id, reason });
      },
      createTransfer: async (input) => {
        await demoSimulate('createTransfer');
        toast.success('Stock transfer requested');
        dispatch({ type: 'CREATE_TRANSFER', input });
      },
      completeTransfer: async (id) => {
        await demoSimulate('completeTransfer');
        toast.success('Transfer completed and stock updated');
        dispatch({ type: 'COMPLETE_TRANSFER', id });
      },
      cancelTransfer: async (id) => {
        await demoSimulate('cancelTransfer');
        toast.success('Transfer cancelled');
        dispatch({ type: 'CANCEL_TRANSFER', id });
      },
      createBranch: async (input) => {
        await demoSimulate('createBranch');
        toast.success('Store branch created');
        dispatch({ type: 'CREATE_BRANCH', input });
      },
      updateBranch: async (id, patch) => {
        await demoSimulate('updateBranch');
        toast.success('Branch updated');
        dispatch({ type: 'UPDATE_BRANCH', id, patch });
      },
      deleteBranch: async (id) => {
        await demoSimulate('deleteBranch');
        toast.success('Branch closed');
        dispatch({ type: 'DELETE_BRANCH', id });
      },
      createUser: async (input) => {
        await demoSimulate('createUser');
        toast.success('User invited successfully');
        dispatch({ type: 'CREATE_USER', input });
      },
      updateUser: async (id, patch) => {
        await demoSimulate('updateUser');
        toast.success('User profile updated');
        dispatch({ type: 'UPDATE_USER', id, patch });
      },
      deleteUser: async (id) => {
        await demoSimulate('deleteUser');
        toast.success('User deactivated');
        dispatch({ type: 'DELETE_USER', id });
      },
      setPermission: async (role, key, value) => {
        await demoSimulate('setPermission');
        toast.success('Permissions updated');
        dispatch({ type: 'SET_PERMISSION', role, key, value });
      },
      updateSettings: async (patch) => {
        await demoSimulate('updateSettings');
        toast.success('Store settings saved');
        dispatch({ type: 'UPDATE_SETTINGS', patch });
      },
      setAlertStatus: async (id, status) => {
        await demoSimulate('setAlertStatus');
        toast.success('Alert status updated');
        dispatch({ type: 'SET_ALERT_STATUS', id, status });
      },
      addAlertNote: async (id, text) => {
        await demoSimulate('addAlertNote');
        toast.success('Investigation note added');
        dispatch({ type: 'ADD_ALERT_NOTE', id, text });
      },
      runAnomalyScan: async () => {
        await demoSimulate('runAnomalyScan');
        const count = Math.floor(Math.random() * 3) + 1;
        toast.success(`Security scan completed. ${count} new pattern${count > 1 ? 's' : ''} flagged.`);
      },
      refetchAll: async () => {
        // No-op in demo mode — data is already loaded
      },
    };
  }, [state, currentUserRole, isAuthenticated, user]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
}