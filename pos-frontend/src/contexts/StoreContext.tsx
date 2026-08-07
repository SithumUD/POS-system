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
  SupplierSummary
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

import productsApi from '../api/productsApi';
import posApi from '../api/posApi';
import salesApi from '../api/salesApi';
import inventoryApi from '../api/inventoryApi';
import suppliersApi from '../api/suppliersApi';
import purchaseOrdersApi from '../api/purchaseOrdersApi';
import alertsApi from '../api/alertsApi';
import branchesApi from '../api/branchesApi';
import settingsApi from '../api/settingsApi';
import usersApi from '../api/usersApi';

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

const normalizeProduct = (p: any): Product => {
  const stock: Record<string, number> = {};
  if (Array.isArray(p.branchStock) && p.branchStock.length > 0) {
    p.branchStock.forEach((bs: any) => {
      const q = bs.quantity ?? 0;
      if (bs.branchSlug) {
        stock[bs.branchSlug] = q;
        stock[bs.branchSlug.toLowerCase()] = q;
      }
      if (bs.branchId) {
        stock[bs.branchId] = q;
      }
    });
  } else if (p.stock && typeof p.stock === 'object' && Object.keys(p.stock).length > 0) {
    Object.assign(stock, p.stock);
  } else if (typeof p.totalQuantity === 'number' && p.totalQuantity > 0) {
    stock['colombo'] = p.totalQuantity;
  }

  const categoryName =
    typeof p.category === 'object' && p.category !== null
      ? p.category.name || p.category.slug
      : p.category || 'Beverages';

  const preferredSupp =
    typeof p.preferredSupplier === 'object' && p.preferredSupplier !== null
      ? p.preferredSupplier
      : p.supplierId
      ? { id: p.supplierId, name: p.supplier || '' }
      : p.supplier
      ? { id: `s-${p.supplier.toLowerCase().replace(/\s+/g, '-')}`, name: p.supplier }
      : null;

  const suppliersList: SupplierSummary[] = Array.isArray(p.suppliers) && p.suppliers.length > 0
    ? p.suppliers
    : preferredSupp ? [preferredSupp] : [];

  return {
    id: p.id,
    sku: p.sku || '',
    barcode: p.barcode || '',
    name: p.name || '',
    category: categoryName as any,
    unitPrice: p.unitPrice ?? p.price ?? 0,
    costPrice: p.costPrice ?? p.cost ?? 0,
    taxRate: p.taxRate ?? 0.1,
    reorderThreshold: p.reorderThreshold ?? p.threshold ?? 0,
    unitOfMeasure: (p.unitOfMeasure || p.unit || 'EACH') as any,
    unitLabel: p.unitLabel || p.unit || 'Each',
    stock,
    supplier: preferredSupp?.name || p.supplier || undefined,
    preferredSupplier: preferredSupp,
    suppliers: suppliersList,
    active: p.active ?? true,
    imageUrl: p.imageUrl || null,
    updatedAt: p.updatedAt || new Date().toISOString(),
    createdAt: p.createdAt || new Date().toISOString(),
  };
};

const normalizeMovement = (m: any) => {
  const timeStr = m.createdAt || m.at || new Date().toISOString();
  return {
    id: m.id,
    productId: m.productId || (typeof m.product === 'object' ? m.product?.id : ''),
    product: typeof m.product === 'object' ? m.product : { id: m.productId, sku: m.productSku, name: m.productName },
    productSku: m.productSku || (typeof m.product === 'object' ? m.product?.sku : ''),
    productName: m.productName || (typeof m.product === 'object' ? m.product?.name : ''),
    branch: m.branchSlug || (typeof m.branch === 'object' ? m.branch?.slug : m.branch) || '',
    branchSlug: m.branchSlug || (typeof m.branch === 'object' ? m.branch?.slug : m.branch) || '',
    branchName: m.branchName || '',
    type: m.type,
    quantity: m.quantity ?? m.qty ?? 0,
    qty: m.quantity ?? m.qty ?? 0,
    referenceId: m.referenceId || m.reference || '',
    reference: m.referenceId || m.reference || '',
    note: m.note || m.reason || '',
    reason: m.reason || m.note || '',
    createdByName: m.createdByName || m.actor?.name || 'System',
    createdAt: timeStr,
    at: timeStr,
    updatedAt: m.updatedAt || timeStr,
  };
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [deletedProductIds, setDeletedProductIds] = useState<Set<string>>(new Set());
  const { user, isAuthenticated } = useAuth();
  const currentUserRole: Role = user?.role || 'CASHIER';

  const fetchBackendData = async () => {
    if (!isAuthenticated) return;

    try {
      // 1. Fetch Products & Categories
      const prodRes = await productsApi.getProducts({ size: 200, activeOnly: false });
      if (prodRes?.success && prodRes.data?.content) {
        const normalized = prodRes.data.content
          .filter((p: any) => !deletedProductIds.has(p.id))
          .map(normalizeProduct);
        dispatch({ type: 'SET_PRODUCTS', products: normalized });
      }
      const catRes = await productsApi.getCategories();
      if (catRes?.success && catRes.data) {
        dispatch({ type: 'SET_CATEGORIES', categories: catRes.data });
      }
      const catTreeRes = await productsApi.getCategoryTree();
      if (catTreeRes?.success && catTreeRes.data) {
        dispatch({ type: 'SET_CATEGORY_TREE', categoryTree: catTreeRes.data });
      }

      // 2. Fetch Sales
      const salesRes = await salesApi.getSales({ size: 100 });
      if (salesRes?.success && salesRes.data?.content) {
        dispatch({ type: 'SET_SALES', sales: salesRes.data.content as unknown as any[] });
      }

      // 3. Fetch Suppliers
      const suppRes = await suppliersApi.getSuppliers({ size: 100 });
      if (suppRes?.success && suppRes.data?.content) {
        dispatch({ type: 'SET_SUPPLIERS', suppliers: suppRes.data.content as unknown as Supplier[] });
      }

      // 4. Fetch Purchase Orders
      const poRes = await purchaseOrdersApi.getPurchaseOrders({ size: 100 });
      if (poRes?.success && poRes.data?.content) {
        dispatch({ type: 'SET_PURCHASE_ORDERS', purchaseOrders: poRes.data.content as unknown as any[] });
      }

      // 5. Fetch Stock Movements
      const mvRes = await inventoryApi.getMovements({ size: 100 });
      if (mvRes?.success && mvRes.data?.content) {
        const normalizedMvs = mvRes.data.content.map(normalizeMovement);
        dispatch({ type: 'SET_MOVEMENTS', movements: normalizedMvs });
      }

      // 6. Fetch Transfers
      const trRes = await inventoryApi.getTransfers({ size: 100 });
      if (trRes?.success && trRes.data?.content) {
        dispatch({ type: 'SET_TRANSFERS', transfers: trRes.data.content as unknown as any[] });
      }

      // 7. Fetch Alerts
      const alertRes = await alertsApi.getAlerts({ size: 100 });
      if (alertRes?.success && alertRes.data?.content) {
        dispatch({ type: 'SET_ALERTS', alerts: alertRes.data.content as unknown as any[] });
      }

      // 8. Fetch Branches
      const branchRes = await branchesApi.getBranches({ size: 100 });
      if (branchRes?.success && Array.isArray(branchRes.data)) {
        dispatch({ type: 'SET_BRANCHES', branches: branchRes.data as unknown as Branch[] });
      } else if (branchRes?.success && (branchRes.data as any)?.content) {
        dispatch({ type: 'SET_BRANCHES', branches: (branchRes.data as any).content as unknown as Branch[] });
      }

      // 9. Fetch Users
      const userRes = await usersApi.getUsers({ size: 100 });
      if (userRes?.success && userRes.data?.content) {
        dispatch({ type: 'SET_USERS', users: userRes.data.content as unknown as User[] });
      }

      // 10. Fetch Settings
      const setRes = await settingsApi.getSettings();
      if (setRes?.success && setRes.data) {
        dispatch({ type: 'SET_SETTINGS', settings: setRes.data as unknown as StoreSettings });
      }

      // 11. Fetch Role Permissions
      const permRes = await usersApi.getRolePermissions();
      if (permRes?.success && permRes.data) {
        dispatch({ type: 'SET_PERMISSIONS', permissions: permRes.data });
      }
    } catch (err: any) {
      console.error('Backend connection error:', err);
      toast.error(err?.message || 'Failed to connect to backend server at http://localhost:8080/api/v1');
    }
  };

  useEffect(() => {
    fetchBackendData();
  }, [isAuthenticated, state.branch]);

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
      setCurrentUserRole: () => {},
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
        return b?.shortName || b?.short || b?.name || branch;
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
        try {
          const totals = computeTotals(state.cart, state.discount, (state.settings?.taxRate ?? 10) / 100);
          const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `key-${Date.now()}`;
          const payload = {
            branchSlug: state.branch,
            registerId: 'REG-01',
            idempotencyKey,
            subtotal: totals.subtotal,
            discount: totals.discount,
            tax: totals.tax,
            total: totals.total,
            items: state.cart.map((line) => ({
              productId: line.productId,
              sku: line.sku,
              name: line.name,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              discount: 0,
              lineTotal: line.unitPrice * line.quantity,
            })),
            payments: [
              {
                method: state.payment,
                amount: totals.total,
                tenderedAmount: tendered || totals.total,
              },
            ],
          };
          const res = await posApi.checkout(payload, idempotencyKey);
          if (res?.success && res.data) {
            toast.success('Sale completed successfully!');
            const backendData: any = res.data;
            const mappedSale = {
              ...backendData,
              id: backendData.saleId || backendData.id
            };
            dispatch({ type: 'COMPLETE_SALE', tendered, payload: mappedSale });
            fetchBackendData();
          } else {
            toast.error(res?.message || 'Checkout failed');
          }
        } catch (err: any) {
          toast.error(err?.message || 'Checkout failed to connect to backend server');
        }
      },
      clearLastSale: () => dispatch({ type: 'CLEAR_LAST_SALE' }),
      adjustStock: async (input) => {
        try {
          const targetBranch = state.branches.find((b) => b.id === input.branchId || b.slug === input.branchId);
          const branchSlug = targetBranch?.slug || input.branchId;
          const actionType = input.type === 'Add' ? 'ADD' : input.type === 'Remove' ? 'REMOVE' : 'CORRECTION';

          const res = await inventoryApi.adjustStock({
            branchSlug,
            productId: input.productId,
            action: actionType,
            adjustmentType: actionType,
            quantity: input.quantity,
            reason: input.reason || input.note || 'Stock adjustment',
            note: input.note,
          });
          if (res?.success) {
            toast.success('Stock adjustment saved');
            dispatch({ type: 'ADJUST_STOCK', input });
            fetchBackendData();
          } else {
            toast.error(res?.message || 'Stock adjustment failed');
          }
        } catch (err: any) {
          toast.error(err?.message || 'Stock adjustment failed to connect to backend');
        }
      },
      saveProduct: async (product) => {
        try {
          const prefId =
            typeof product.preferredSupplier === 'object' && product.preferredSupplier
              ? product.preferredSupplier.id
              : (product as any).supplierId || null;

          const suppIds = Array.isArray(product.suppliers) && product.suppliers.length > 0
            ? product.suppliers.map((s) => s.id)
            : prefId ? [prefId] : [];

          const res = await productsApi.updateProduct(product.id, {
            sku: product.sku,
            barcode: product.barcode,
            name: product.name,
            price: product.unitPrice ?? (product as any).price ?? 0,
            cost: product.costPrice ?? (product as any).cost ?? 0,
            unitPrice: product.unitPrice,
            costPrice: product.costPrice,
            taxRate: product.taxRate,
            threshold: product.reorderThreshold ?? (product as any).threshold ?? 0,
            reorderThreshold: product.reorderThreshold,
            supplierId: prefId || undefined,
            preferredSupplierId: prefId || undefined,
            supplierIds: suppIds,
            active: product.active,
          });
          if (res?.success) {
            toast.success('Product updated');
            dispatch({ type: 'SAVE_PRODUCT', product });
            fetchBackendData();
          } else {
            toast.error(res?.message || 'Product update failed');
          }
        } catch (err: any) {
          toast.error(err?.message || 'Failed to update product on backend');
        }
      },
      createProduct: async (product) => {
        try {
          const categorySlug =
            typeof product.category === 'object' && product.category
              ? product.category.slug
              : typeof product.category === 'string'
              ? (product.category as string).toLowerCase().replace(/\s+/g, '-')
              : (product as any).categorySlug || null;

          const res = await productsApi.createProduct({
            sku: product.sku,
            barcode: product.barcode,
            name: product.name,
            categorySlug: categorySlug || null,
            price: product.unitPrice ?? (product as any).price ?? 0,
            cost: product.costPrice ?? (product as any).cost ?? 0,
            unitPrice: product.unitPrice,
            costPrice: product.costPrice,
            taxRate: product.taxRate,
            threshold: product.reorderThreshold ?? (product as any).threshold ?? 0,
            reorderThreshold: product.reorderThreshold,
            unitOfMeasure: product.unitOfMeasure,
            active: product.active ?? true,
            imageUrl: product.imageUrl,
          });
          if (res?.success) {
            toast.success('Product created');
            dispatch({ type: 'CREATE_PRODUCT', product });
            fetchBackendData();
          } else {
            toast.error(res?.message || 'Product creation failed');
          }
        } catch (err: any) {
          toast.error(err?.message || 'Failed to create product on backend');
        }
      },
      duplicateProduct: async (id) => {
        try {
          const res = await productsApi.duplicateProduct(id);
          if (res?.success) {
            toast.success('Product duplicated as draft', { description: 'Status is set to Inactive until reviewed.' });
            if (res.data) {
              const duplicatedProd = normalizeProduct(res.data);
              dispatch({ type: 'CREATE_PRODUCT', product: duplicatedProd });
            } else {
              dispatch({ type: 'DUPLICATE_PRODUCT', id });
            }
            await fetchBackendData();
          } else {
            toast.error(res?.message || 'Product duplicate failed');
          }
        } catch (err: any) {
          toast.error(err?.message || 'Failed to duplicate product on backend');
        }
      },
      toggleActive: async (id) => {
        const prod = state.products.find((p) => p.id === id);
        try {
          const res = await productsApi.toggleProductActive(id);
          if (res?.success) {
            const nextState = prod ? !prod.active : true;
            toast.success(`Product ${nextState ? 'activated' : 'deactivated'}`);
            dispatch({ type: 'TOGGLE_ACTIVE', id });
            await fetchBackendData();
          } else {
            toast.error(res?.message || 'Failed to toggle product status');
          }
        } catch (err: any) {
          toast.error(err?.message || 'Failed to update product status on backend');
        }
      },
      deleteProduct: async (id) => {
        try {
          const res = await productsApi.deleteProduct(id);
          if (res?.success) {
            toast.success('Product deleted');
            setDeletedProductIds((prev: Set<string>) => new Set(prev).add(id));
            dispatch({ type: 'DELETE_PRODUCT', id });
            await fetchBackendData();
          } else {
            toast.error(res?.message || 'Failed to delete product');
          }
        } catch (err: any) {
          toast.error(err?.message || 'Failed to delete product on backend');
        }
      },
      createCategory: async (payload) => {
        try {
          const res = await productsApi.createCategory({
            name: payload.name,
            slug: payload.slug || payload.name.toLowerCase().replace(/\s+/g, '-'),
            parentId: payload.parentId,
            description: payload.description,
          });
          if (res?.success) {
            toast.success(`Category '${payload.name}' created`);
            fetchBackendData();
          } else {
            toast.error(res?.message || 'Failed to create category');
          }
        } catch (err: any) {
          toast.error(err?.message || 'Failed to create category on backend');
        }
      },
      updateCategory: async (id, payload) => {
        try {
          const res = await productsApi.updateCategory(id, payload);
          if (res?.success) {
            toast.success('Category updated');
            fetchBackendData();
          } else {
            toast.error(res?.message || 'Failed to update category');
          }
        } catch (err: any) {
          toast.error(err?.message || 'Failed to update category on backend');
        }
      },
      deleteCategory: async (id) => {
        try {
          const res = await productsApi.deleteCategory(id);
          if (res?.success) {
            toast.success('Category deleted');
            fetchBackendData();
          } else {
            toast.error(res?.message || 'Failed to delete category');
          }
        } catch (err: any) {
          toast.error(err?.message || 'Failed to delete category on backend');
        }
      },
      toggleOnline: () => dispatch({ type: 'TOGGLE_ONLINE' }),
      createPurchaseOrder: async (input, send) => {
        try {
          const res = await purchaseOrdersApi.createPurchaseOrder({
            supplierId: input.supplierId,
            branchSlug: input.branch,
            expectedAt: input.expectedAt,
            notes: input.notes,
            status: send ? 'SENT' : 'DRAFT',
            items: input.lines.map((l) => ({
              productId: l.productId,
              quantityOrdered: l.ordered,
              unitCost: l.unitCost,
            })),
          });
          if (res?.success) {
            toast.success(send ? 'Purchase order sent' : 'Purchase order created');
            dispatch({ type: 'CREATE_PO', input, send });
            await fetchBackendData();
          } else {
            toast.error(res?.message || 'Purchase order creation failed');
          }
        } catch (err: any) {
          toast.error(err?.message || 'Failed to create PO on backend');
        }
      },
      updatePurchaseOrder: async (id, input) => {
        dispatch({ type: 'UPDATE_PO', id, input });
      },
      setPoStatus: async (id, status) => {
        try {
          const res = await purchaseOrdersApi.updatePoStatus(id, status);
          if (res?.success) {
            toast.success(`PO status updated to ${status}`);
            dispatch({ type: 'SET_PO_STATUS', id, status });
            await fetchBackendData();
          } else {
            toast.error(res?.message || 'Failed to update PO status');
          }
        } catch (err: any) {
          toast.error(err?.message || 'Failed to update PO status on backend');
        }
      },
      receivePurchaseOrder: async (id, receipts, note) => {
        try {
          const itemQuantities: Record<string, number> = {};
          Object.entries(receipts).forEach(([pId, qty]) => {
            const num = Number(qty) || 0;
            if (num > 0) {
              itemQuantities[pId] = num;
            }
          });

          const res = await purchaseOrdersApi.receivePurchaseOrder(id, {
            itemQuantities,
            notes: note,
          });

          if (res?.success) {
            toast.success('Stock shipment received');
            dispatch({ type: 'RECEIVE_PO', id, receipts, note });
            await fetchBackendData();
          } else {
            toast.error(res?.message || 'Shipment receiving failed');
          }
        } catch (err: any) {
          toast.error(err?.message || 'Failed to receive PO on backend');
        }
      },
      deletePurchaseOrder: async (id) => {
        dispatch({ type: 'DELETE_PO', id });
      },
      createSupplier: async (input) => {
        try {
          const res = await suppliersApi.createSupplier({
            name: input.name,
            contactPerson: input.contactPerson || undefined,
            phone: input.phone || undefined,
            contactEmail: input.contactEmail || input.email || undefined,
            address: input.address || undefined,
            paymentTerms: input.paymentTerms || undefined,
            leadTimeDays: (input as any).leadTimeDays || undefined,
            status: input.status || 'ACTIVE',
          });
          if (res?.success) {
            toast.success('Supplier created');
            dispatch({ type: 'CREATE_SUPPLIER', input });
            fetchBackendData();
          } else {
            toast.error(res?.message || 'Failed to create supplier');
          }
        } catch (err: any) {
          toast.error(err?.message || 'Failed to create supplier on backend');
        }
      },
      updateSupplier: async (id, input) => {
        try {
          const res = await suppliersApi.updateSupplier(id, {
            name: input.name,
            contactPerson: input.contactPerson || undefined,
            phone: input.phone || undefined,
            contactEmail: input.contactEmail || undefined,
            address: input.address || undefined,
            paymentTerms: input.paymentTerms || undefined,
            status: input.status || 'ACTIVE',
          });
          if (res?.success) {
            toast.success('Supplier updated');
            dispatch({ type: 'UPDATE_SUPPLIER', id, input });
            fetchBackendData();
          } else {
            toast.error(res?.message || 'Failed to update supplier');
          }
        } catch (err: any) {
          toast.error(err?.message || 'Failed to update supplier on backend');
        }
      },
      deleteSupplier: async (id) => {
        try {
          const res = await suppliersApi.deleteSupplier(id);
          if (res?.success) {
            toast.success('Supplier deleted');
            dispatch({ type: 'DELETE_SUPPLIER', id });
          } else {
            toast.error(res?.message || 'Failed to delete supplier');
          }
        } catch (err: any) {
          toast.error(err?.message || 'Failed to delete supplier on backend');
        }
      },
      voidSale: async (id, reason) => {
        try {
          const res = await salesApi.voidSale(id, { reason });
          if (res?.success) {
            toast.success('Sale voided');
            dispatch({ type: 'VOID_SALE', id, reason });
            fetchBackendData();
          } else {
            toast.error(res?.message || 'Failed to void sale');
          }
        } catch (err: any) {
          toast.error(err?.message || 'Failed to void sale on backend');
        }
      },
      refundSale: async (id, reason, refundAmount, itemQuantities) => {
        try {
          const sale = state.sales.find((s) => s.id === id || s.receiptNumber === id);
          const amount = refundAmount ?? sale?.total ?? 0;

          const itemsMap: Record<string, number> = itemQuantities ? { ...itemQuantities } : {};
          if (!itemQuantities && sale) {
            const itemsList = sale.items || sale.lines || [];
            itemsList.forEach((item: any) => {
              const pId = item.productId || (item.product ? item.product.id : '');
              const qty = item.quantityOrdered ?? item.ordered ?? item.quantity ?? 0;
              if (pId && qty > 0) {
                itemsMap[pId] = qty;
              }
            });
          }

          const res = await salesApi.refundSale(id, {
            reason,
            refundAmount: amount,
            itemQuantities: Object.keys(itemsMap).length > 0 ? itemsMap : undefined,
          });

          if (res?.success) {
            toast.success('Sale refunded');
            dispatch({ type: 'REFUND_SALE', id, reason });
            await fetchBackendData();
          } else {
            toast.error(res?.message || 'Failed to refund sale');
          }
        } catch (err: any) {
          toast.error(err?.message || 'Failed to refund sale on backend');
        }
      },
      createTransfer: async (input) => {
        try {
          const res = await inventoryApi.createTransfer({
            fromBranchSlug: input.from,
            toBranchSlug: input.to,
            note: input.note,
            items: input.lines.map((l) => ({ productId: l.productId, quantity: l.qty })),
          });
          if (res?.success) {
            toast.success('Stock transfer requested');
            dispatch({ type: 'CREATE_TRANSFER', input });
            fetchBackendData();
          } else {
            toast.error(res?.message || 'Failed to create transfer');
          }
        } catch (err: any) {
          toast.error(err?.message || 'Failed to create transfer on backend');
        }
      },
      completeTransfer: async (id) => {
        try {
          const res = await inventoryApi.completeTransfer(id);
          if (res?.success) {
            toast.success('Transfer completed');
            dispatch({ type: 'COMPLETE_TRANSFER', id });
            fetchBackendData();
          } else {
            toast.error(res?.message || 'Failed to complete transfer');
          }
        } catch (err: any) {
          toast.error(err?.message || 'Failed to complete transfer on backend');
        }
      },
      cancelTransfer: async (id) => {
        try {
          const res = await inventoryApi.cancelTransfer(id);
          if (res?.success) {
            toast.success('Transfer cancelled');
            dispatch({ type: 'CANCEL_TRANSFER', id });
          } else {
            toast.error(res?.message || 'Failed to cancel transfer');
          }
        } catch (err: any) {
          toast.error(err?.message || 'Failed to cancel transfer on backend');
        }
      },
      createBranch: async (input) => {
        try {
          const res = await branchesApi.createBranch({
            name: input.name,
            shortName: input.shortName || undefined,
            address: input.address || undefined,
            phone: input.phone || undefined,
            status: input.status || 'OPEN',
          });
          if (res?.success) {
            toast.success('Store branch created');
            dispatch({ type: 'CREATE_BRANCH', input });
            fetchBackendData();
          } else {
            toast.error(res?.message || 'Failed to create branch');
          }
        } catch (err: any) {
          toast.error(err?.message || 'Failed to create branch on backend');
        }
      },
      updateBranch: async (id, patch) => {
        try {
          const res = await branchesApi.updateBranch(id, patch);
          if (res?.success) {
            toast.success('Store branch updated');
            dispatch({ type: 'UPDATE_BRANCH', id, patch });
          } else {
            toast.error(res?.message || 'Failed to update branch');
          }
        } catch (err: any) {
          toast.error(err?.message || 'Failed to update branch on backend');
        }
      },
      deleteBranch: async (id) => {
        try {
          const res = await branchesApi.deleteBranch(id);
          if (res?.success) {
            toast.success('Store branch closed');
            dispatch({ type: 'DELETE_BRANCH', id });
          } else {
            toast.error(res?.message || 'Failed to close branch');
          }
        } catch (err: any) {
          toast.error(err?.message || 'Failed to delete branch on backend');
        }
      },
      createUser: async (input) => {
        try {
          const bSlug = (input as any).branchSlug !== undefined ? (input as any).branchSlug : (input.assignedBranch ? ((input.assignedBranch as any).slug || (input.assignedBranch as any).id) : null);
          const res = await usersApi.createUser({
            name: input.name || input.fullName || '',
            email: input.email,
            role: input.role as any,
            branchSlug: bSlug,
            status: input.status || 'ACTIVE',
          });
          if (res?.success) {
            toast.success('User invited');
            dispatch({ type: 'CREATE_USER', input });
            fetchBackendData();
          } else {
            toast.error(res?.message || 'Failed to create user');
          }
        } catch (err: any) {
          toast.error(err?.message || 'Failed to create user on backend');
        }
      },
      updateUser: async (id, patch) => {
        try {
          const bSlug = (patch as any).branchSlug !== undefined ? (patch as any).branchSlug : (patch.assignedBranch ? ((patch.assignedBranch as any).slug || (patch.assignedBranch as any).id) : undefined);
          const res = await usersApi.updateUser(id, {
            name: patch.name || patch.fullName,
            email: patch.email,
            role: patch.role as any,
            branchSlug: bSlug,
          });
          if (res?.success) {
            toast.success('User profile updated');
            dispatch({ type: 'UPDATE_USER', id, patch });
          } else {
            toast.error(res?.message || 'Failed to update user');
          }
        } catch (err: any) {
          toast.error(err?.message || 'Failed to update user on backend');
        }
      },
      deleteUser: async (id) => {
        try {
          const res = await usersApi.deleteUser(id);
          if (res?.success) {
            toast.success('User deactivated');
            dispatch({ type: 'DELETE_USER', id });
          } else {
            toast.error(res?.message || 'Failed to deactivate user');
          }
        } catch (err: any) {
          toast.error(err?.message || 'Failed to delete user on backend');
        }
      },
      setPermission: async (role, key, value) => {
        const updated = {
          ...state.permissions,
          [role]: {
            ...state.permissions[role],
            [key]: value,
          },
        };
        try {
          const res = await usersApi.updateRolePermissions(updated);
          if (res?.success) {
            toast.success('Permissions updated');
            dispatch({ type: 'SET_PERMISSION', role, key, value });
          } else {
            toast.error(res?.message || 'Failed to update role permissions');
          }
        } catch (err: any) {
          toast.error(err?.message || 'Failed to update role permissions on backend');
        }
      },
      updateSettings: async (patch) => {
        try {
          const res = await settingsApi.updateSettings(patch);
          if (res?.success) {
            toast.success('Store settings saved');
            dispatch({ type: 'UPDATE_SETTINGS', patch });
          } else {
            toast.error(res?.message || 'Failed to update settings');
          }
        } catch (err: any) {
          toast.error(err?.message || 'Failed to update settings on backend');
        }
      },
      setAlertStatus: async (id, status) => {
        try {
          const res = await alertsApi.updateAlertStatus(id, status);
          if (res?.success) {
            toast.success('Alert status updated');
            dispatch({ type: 'SET_ALERT_STATUS', id, status });
          } else {
            toast.error(res?.message || 'Failed to update alert status');
          }
        } catch (err: any) {
          toast.error(err?.message || 'Failed to update alert status on backend');
        }
      },
      addAlertNote: async (id, text) => {
        try {
          const res = await alertsApi.addAlertNote(id, { note: text });
          if (res?.success) {
            toast.success('Investigation note added');
            dispatch({ type: 'ADD_ALERT_NOTE', id, text });
          } else {
            toast.error(res?.message || 'Failed to add note');
          }
        } catch (err: any) {
          toast.error(err?.message || 'Failed to add alert note on backend');
        }
      },
      runAnomalyScan: async () => {
        try {
          const res = await alertsApi.scanAlerts(state.branch);
          if (res?.success) {
            toast.success(`Security scan completed. ${res.data.newAlerts} new alerts flagged.`);
            fetchBackendData();
          } else {
            toast.error(res?.message || 'Security scan failed');
          }
        } catch (err: any) {
          toast.error(err?.message || 'Failed to run security scan on backend');
        }
      },
      refetchAll: fetchBackendData,
    };
  }, [state, currentUserRole, isAuthenticated]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
}