import {
  Branch,
  PoEvent,
  PoLine,
  PoStatus,
  Product,
  PurchaseOrder,
  StockMovement,
  Supplier,
  Transfer,
  TransferLine,
  User,
  StockTransferItem,
  UserSummary
} from '../types';
import {
  Action,
  applyStock,
  movement,
  pad,
  State,
  stockAt
} from './storeState';
import { detectAnomalies } from '../utils/anomaly';

function nowIso(): string {
  return new Date().toISOString();
}

function label(state: State, id: string): string {
  return state.branches.find((b) => b.slug === id || b.id === id)?.shortName ?? id;
}

function event(description: string, actorName = 'User'): PoEvent {
  const now = nowIso();
  const actorObj: UserSummary = { id: 'u-1', name: actorName, email: `${actorName.toLowerCase().replace(/\s+/g, '.')}@nexpos.app`, role: 'ADMIN' };
  return {
    id: `e-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    description,
    text: description,
    occurredAt: now,
    at: now,
    actor: actorObj,
    createdAt: now,
    updatedAt: now
  };
}

function statusFromLines(lines: PoLine[], current: PoStatus): PoStatus {
  const received = lines.reduce((sum, l) => sum + (l.quantityReceived ?? l.received ?? 0), 0);
  const ordered = lines.reduce((sum, l) => sum + (l.quantityOrdered ?? l.ordered ?? 0), 0);
  if (received === 0) return current === 'DRAFT' ? 'DRAFT' : 'SENT';
  if (received >= ordered) return 'RECEIVED';
  return 'PARTIALLY_RECEIVED';
}

function buildLines(products: Product[], drafts: { productId: string; ordered: number; unitCost: number }[], existing: PoLine[] = []): PoLine[] {
  const now = nowIso();
  return drafts
    .filter((draft) => draft.ordered > 0)
    .map((draft) => {
      const product = products.find((p) => p.id === draft.productId);
      const prior = existing.find((l) => (l.product?.id || l.productId) === draft.productId);
      const priorReceived = prior?.quantityReceived ?? prior?.received ?? 0;
      return {
        id: prior?.id || `poi-${draft.productId}-${Date.now()}`,
        product: product ? { id: product.id, sku: product.sku, name: product.name } : { id: draft.productId, sku: '—', name: draft.productId },
        productId: draft.productId,
        name: product?.name ?? draft.productId,
        sku: product?.sku ?? '—',
        quantityOrdered: draft.ordered,
        ordered: draft.ordered,
        quantityReceived: Math.min(priorReceived, draft.ordered),
        received: Math.min(priorReceived, draft.ordered),
        unitCost: draft.unitCost,
        createdAt: prior?.createdAt || now,
        updatedAt: now
      };
    });
}

function restock(
  state: State,
  saleId: string,
  labelStr: string
): Pick<State, 'products' | 'movements'> | null {
  const sale = state.sales.find((s) => s.receiptNumber === saleId || s.id === saleId);
  if (!sale) return null;
  const at = nowIso();
  let products = state.products;
  const movements: StockMovement[] = [];
  const branchKey = !sale?.branch ? '' : typeof sale.branch === 'string' ? sale.branch : sale.branch?.slug || sale.branch?.id || '';
  const linesToRestock = sale.lines || (sale.items || []).map((i: any) => ({
    productId: i.productId || i.product?.id || i.id || '',
    quantity: i.quantity ?? i.quantityOrdered ?? i.ordered ?? 0,
    name: i.productNameSnapshot || i.name || i.product?.name || '',
    sku: i.productSkuSnapshot || i.sku || i.product?.sku || '',
    unitPrice: i.unitPriceAtSale ?? i.unitPrice ?? i.unitCost ?? 0
  }));
  linesToRestock.forEach((line) => {
    products = applyStock(products, line.productId, branchKey, line.quantity, at);
    movements.push(
      movement(
        state.saleSeq,
        line.productId,
        branchKey,
        'VOID',
        line.quantity,
        sale.receiptNumber || sale.id,
        labelStr,
        at
      )
    );
  });
  return { products, movements: [...movements, ...state.movements] };
}

/** Handles purchasing, suppliers, transfers, branches, people, alerts and settings. */
export function opsReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'CREATE_PO': {
      const supplier = state.suppliers.find((s) => s.id === action.input.supplierId);
      if (!supplier) return state;
      const lines = buildLines(state.products, action.input.lines);
      if (lines.length === 0) return state;
      const poNumber = `PO-${state.poSeq}`;
      const uuid = `550e8400-e29b-41d4-a716-44665544${state.poSeq}`;
      const now = nowIso();
      const targetBranch = state.branches.find((b) => b.slug === action.input.branch || b.id === action.input.branch);
      const branchSummary = targetBranch ? { id: targetBranch.id, slug: targetBranch.slug, name: targetBranch.name } : { id: `branch-${action.input.branch}`, slug: action.input.branch, name: action.input.branch };

      const po: PurchaseOrder = {
        id: uuid,
        poNumber,
        supplierId: supplier.id,
        supplier: { id: supplier.id, name: supplier.name },
        branch: branchSummary,
        items: lines,
        lines,
        status: action.send ? 'SENT' : 'DRAFT',
        createdAt: now,
        updatedAt: now,
        expectedAt: action.input.expectedAt,
        notes: action.input.notes,
        events: action.send
          ? [event('Purchase order created'), event(`Sent to ${supplier.name}`)]
          : [event('Purchase order created')],
        activity: action.send
          ? [event('Purchase order created'), event(`Sent to ${supplier.name}`)]
          : [event('Purchase order created')]
      };
      return { ...state, purchaseOrders: [po, ...state.purchaseOrders], poSeq: state.poSeq + 1 };
    }

    case 'UPDATE_PO': {
      const supplier = state.suppliers.find((s) => s.id === action.input.supplierId);
      return {
        ...state,
        purchaseOrders: state.purchaseOrders.map((po) => {
          if (po.id !== action.id && po.poNumber !== action.id) return po;
          const lines = buildLines(state.products, action.input.lines, po.items || po.lines);
          const targetBranch = state.branches.find((b) => b.slug === action.input.branch || b.id === action.input.branch);
          const branchSummary = targetBranch ? { id: targetBranch.id, slug: targetBranch.slug, name: targetBranch.name } : { id: `branch-${action.input.branch}`, slug: action.input.branch, name: action.input.branch };
          const now = nowIso();

          return {
            ...po,
            supplierId: supplier?.id ?? po.supplierId,
            supplier: supplier ? { id: supplier.id, name: supplier.name } : po.supplier,
            branch: branchSummary,
            expectedAt: action.input.expectedAt,
            notes: action.input.notes,
            items: lines,
            lines,
            status: statusFromLines(lines, po.status),
            events: [...(po.events || po.activity), event('Order details updated')],
            activity: [...(po.events || po.activity), event('Order details updated')],
            updatedAt: now
          };
        })
      };
    }

    case 'SET_PO_STATUS': {
      const labels: Record<PoStatus, string> = {
        DRAFT: 'Returned to draft',
        SENT: 'Sent to supplier',
        PARTIALLY_RECEIVED: 'Marked as partially received',
        RECEIVED: 'Marked as fully received',
        CLOSED: 'Order closed',
        CANCELLED: 'Order cancelled'
      };
      const now = nowIso();
      return {
        ...state,
        purchaseOrders: state.purchaseOrders.map((po) =>
          po.id === action.id || po.poNumber === action.id
            ? {
                ...po,
                status: action.status,
                events: [...(po.events || po.activity), event(labels[action.status])],
                activity: [...(po.events || po.activity), event(labels[action.status])],
                updatedAt: now
              }
            : po
        )
      };
    }

    case 'RECEIVE_PO': {
      const po = state.purchaseOrders.find((p) => p.id === action.id || p.poNumber === action.id);
      if (!po) return state;
      const at = nowIso();
      let products = state.products;
      const movements: StockMovement[] = [];
      let receivedUnits = 0;
      const poBranchKey = !po?.branch ? '' : typeof po.branch === 'string' ? po.branch : po.branch?.slug || po.branch?.id || '';

      const currentLines = po.items || po.lines;
      const lines = currentLines.map((line) => {
        const lineProdId = line.product?.id || line.productId || '';
        const lineOrdered = line.quantityOrdered ?? line.ordered ?? 0;
        const lineReceived = line.quantityReceived ?? line.received ?? 0;
        const requested = Math.max(Math.round(action.receipts[lineProdId] ?? 0), 0);
        const qty = Math.min(requested, lineOrdered - lineReceived);
        if (qty <= 0) return line;
        receivedUnits += qty;
        products = applyStock(products, lineProdId, poBranchKey, qty, at);
        movements.push(
          movement(
            state.poSeq,
            lineProdId,
            poBranchKey,
            'PURCHASE',
            qty,
            po.poNumber || po.id,
            action.note.trim() ? `${po.poNumber || po.id} received — ${action.note.trim()}` : `${po.poNumber || po.id} received`,
            at
          )
        );
        return {
          ...line,
          quantityReceived: lineReceived + qty,
          received: lineReceived + qty,
          updatedAt: at
        };
      });

      if (receivedUnits === 0) return state;
      const status = statusFromLines(lines, po.status);
      const totalOrdered = lines.reduce((sum, l) => sum + (l.quantityOrdered ?? l.ordered ?? 0), 0);
      const totalReceived = lines.reduce((sum, l) => sum + (l.quantityReceived ?? l.received ?? 0), 0);

      return {
        ...state,
        products,
        movements: [...movements, ...state.movements],
        purchaseOrders: state.purchaseOrders.map((entry) =>
          entry.id === po.id || entry.poNumber === po.poNumber
            ? {
                ...entry,
                items: lines,
                lines,
                status,
                events: [
                  ...(entry.events || entry.activity),
                  event(`Received ${receivedUnits} units — ${totalReceived} of ${totalOrdered} fulfilled`)
                ],
                activity: [
                  ...(entry.events || entry.activity),
                  event(`Received ${receivedUnits} units — ${totalReceived} of ${totalOrdered} fulfilled`)
                ],
                updatedAt: at
              }
            : entry
        )
      };
    }

    case 'DELETE_PO':
      return {
        ...state,
        purchaseOrders: state.purchaseOrders.filter((po) => po.id !== action.id && po.poNumber !== action.id)
      };

    case 'CREATE_SUPPLIER': {
      const now = nowIso();
      const supplier: Supplier = {
        ...action.input,
        id: `s-${state.supplierSeq}`,
        contactPerson: action.input.contactPerson || action.input.contact || null,
        contactEmail: action.input.contactEmail || action.input.email || null,
        suppliedCategories: action.input.suppliedCategories || (action.input.categories?.map((c) => c.toLowerCase()) ?? []),
        status: action.input.status || 'ACTIVE',
        createdAt: now,
        updatedAt: now
      };
      return {
        ...state,
        suppliers: [supplier, ...state.suppliers],
        supplierSeq: state.supplierSeq + 1
      };
    }

    case 'UPDATE_SUPPLIER': {
      const target = state.suppliers.find((s) => s.id === action.id);
      if (!target) return state;
      const now = nowIso();
      return {
        ...state,
        suppliers: state.suppliers.map((s) =>
          s.id === action.id ? { ...s, ...action.input, updatedAt: now } : s
        ),
        purchaseOrders: state.purchaseOrders.map((po) => {
          const sObj = typeof po.supplier === 'object' ? po.supplier : { id: action.id, name: action.input.name };
          return po.supplierId === action.id || sObj.id === action.id ? { ...po, supplier: { id: action.id, name: action.input.name } } : po;
        })
      };
    }

    case 'DELETE_SUPPLIER':
      return { ...state, suppliers: state.suppliers.filter((s) => s.id !== action.id) };

    case 'VOID_SALE': {
      const sale = state.sales.find((s) => s.id === action.id || s.receiptNumber === action.id);
      if (!sale || sale.status !== 'COMPLETED') return state;
      const restocked = restock(state, action.id, `Sale voided — ${action.reason}`);
      if (!restocked) return state;
      return {
        ...state,
        ...restocked,
        sales: state.sales.map((s) =>
          s.id === action.id || s.receiptNumber === action.id ? { ...s, status: 'VOIDED', note: action.reason, updatedAt: nowIso() } : s
        )
      };
    }

    case 'REFUND_SALE': {
      const sale = state.sales.find((s) => s.id === action.id || s.receiptNumber === action.id);
      if (!sale || sale.status !== 'COMPLETED') return state;
      const restocked = restock(state, action.id, `Refunded — ${action.reason}`);
      if (!restocked) return state;
      return {
        ...state,
        ...restocked,
        sales: state.sales.map((s) =>
          s.id === action.id || s.receiptNumber === action.id ? { ...s, status: 'REFUNDED', note: action.reason, updatedAt: nowIso() } : s
        )
      };
    }

    case 'CREATE_TRANSFER': {
      const { from, to, note } = action.input;
      if (from === to) return state;
      const at = nowIso();
      let products = state.products;
      const movements: StockMovement[] = [];
      const items: StockTransferItem[] = [];
      const lines: TransferLine[] = [];

      action.input.lines.forEach((draft) => {
        const product = state.products.find((p) => p.id === draft.productId);
        if (!product) return;
        const qty = Math.min(Math.max(Math.round(draft.qty), 0), stockAt(product, from));
        if (qty <= 0) return;

        const item: StockTransferItem = {
          id: `ti-${product.id}-${Date.now()}`,
          product: { id: product.id, sku: product.sku, name: product.name },
          productNameSnapshot: product.name,
          productSkuSnapshot: product.sku,
          quantity: qty,
          productId: product.id,
          name: product.name,
          sku: product.sku,
          qty,
          createdAt: at,
          updatedAt: at
        };
        items.push(item);
        lines.push(item);

        products = applyStock(products, product.id, from, -qty, at);
        movements.push(
          movement(
            state.transferSeq,
            product.id,
            from,
            'TRANSFER_OUT',
            -qty,
            `TRF-${pad(state.transferSeq)}`,
            `Sent to ${label(state, to)}`,
            at
          )
        );
      });

      if (items.length === 0) return state;
      const transferNumber = `TRF-${pad(state.transferSeq)}`;
      const uuid = `550e8400-e29b-41d4-a716-44665544${state.transferSeq}`;
      const fromBranchObj = state.branches.find((b) => b.slug === from || b.id === from);
      const toBranchObj = state.branches.find((b) => b.slug === to || b.id === to);

      const transfer: Transfer = {
        id: uuid,
        transferNumber,
        fromBranch: fromBranchObj ? { id: fromBranchObj.id, slug: fromBranchObj.slug, name: fromBranchObj.name } : { id: `branch-${from}`, slug: from, name: from },
        toBranch: toBranchObj ? { id: toBranchObj.id, slug: toBranchObj.slug, name: toBranchObj.name } : { id: `branch-${to}`, slug: to, name: to },
        from,
        to,
        items,
        lines,
        status: 'IN_TRANSIT',
        note,
        createdAt: at,
        updatedAt: at
      };
      return {
        ...state,
        products,
        movements: [...movements, ...state.movements],
        transfers: [transfer, ...state.transfers],
        transferSeq: state.transferSeq + 1
      };
    }

    case 'COMPLETE_TRANSFER': {
      const transfer = state.transfers.find((t) => t.id === action.id || t.transferNumber === action.id);
      if (!transfer || transfer.status !== 'IN_TRANSIT') return state;
      const at = nowIso();
      let products = state.products;
      const movements: StockMovement[] = [];
      const destBranch = transfer.toBranchSlug || (typeof transfer.toBranch === 'string' ? transfer.toBranch : (transfer.toBranch?.slug || ''));
      const sourceBranch = transfer.fromBranchSlug || (typeof transfer.fromBranch === 'string' ? transfer.fromBranch : (transfer.fromBranch?.slug || ''));

      const transferItems = transfer.items || transfer.lines;
      transferItems.forEach((line) => {
        const prodId = line.product?.id || line.productId || '';
        const qty = line.quantity ?? line.qty ?? 0;
        products = applyStock(products, prodId, destBranch, qty, at);
        movements.push(
          movement(
            state.transferSeq,
            prodId,
            destBranch,
            'TRANSFER_IN',
            qty,
            transfer.transferNumber || transfer.id,
            `Received from ${label(state, sourceBranch)}`,
            at
          )
        );
      });
      return {
        ...state,
        products,
        movements: [...movements, ...state.movements],
        transfers: state.transfers.map((t) =>
          t.id === action.id || t.transferNumber === action.id ? { ...t, status: 'COMPLETED', completedAt: at, updatedAt: at } : t
        )
      };
    }

    case 'CANCEL_TRANSFER': {
      const transfer = state.transfers.find((t) => t.id === action.id || t.transferNumber === action.id);
      if (!transfer || transfer.status !== 'IN_TRANSIT') return state;
      const at = nowIso();
      let products = state.products;
      const movements: StockMovement[] = [];
      const sourceBranch = typeof transfer.fromBranch === 'string' ? transfer.fromBranch : transfer.fromBranch.slug;

      const transferItems = transfer.items || transfer.lines;
      transferItems.forEach((line) => {
        const prodId = line.product?.id || line.productId || '';
        const qty = line.quantity ?? line.qty ?? 0;
        products = applyStock(products, prodId, sourceBranch, qty, at);
        movements.push(
          movement(
            state.transferSeq,
            prodId,
            sourceBranch,
            'TRANSFER_IN',
            qty,
            transfer.transferNumber || transfer.id,
            'Transfer cancelled — stock returned',
            at
          )
        );
      });
      return {
        ...state,
        products,
        movements: [...movements, ...state.movements],
        transfers: state.transfers.map((t) =>
          t.id === action.id || t.transferNumber === action.id ? { ...t, status: 'CANCELLED', updatedAt: at } : t
        )
      };
    }

    case 'CREATE_BRANCH': {
      const base = action.input.shortName
        ? action.input.shortName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        : action.input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const slug = state.branches.some((b) => b.slug === base) ? `${base}-${state.branchSeq}` : base;
      const uuid = `550e8400-e29b-41d4-a716-44665544${state.branchSeq}`;
      const now = nowIso();

      const branch: Branch = {
        ...action.input,
        id: uuid,
        slug,
        shortName: action.input.shortName || action.input.name,
        terminalCount: action.input.terminalCount || 1,
        status: action.input.status || 'OPEN',
        todaySales: 0,
        weekSales: 0,
        staff: action.input.staff || 0,
        createdAt: now,
        updatedAt: now
      };
      return {
        ...state,
        branches: [...state.branches, branch],
        products: state.products.map((p) => ({ ...p, stock: { ...p.stock, [slug]: 0 } })),
        branchSeq: state.branchSeq + 1
      };
    }

    case 'UPDATE_BRANCH':
      return {
        ...state,
        branches: state.branches.map((b) => (b.id === action.id || b.slug === action.id ? { ...b, ...action.patch, updatedAt: nowIso() } : b))
      };

    case 'DELETE_BRANCH': {
      if (state.branches.length <= 1) return state;
      const remaining = state.branches.filter((b) => b.id !== action.id && b.slug !== action.id);
      const activeSlug = remaining[0].slug || remaining[0].id;
      return {
        ...state,
        branches: remaining,
        branch: state.branch === action.id ? activeSlug : state.branch,
        products: state.products.map((product) => {
          const stock = { ...product.stock };
          delete stock[action.id];
          return { ...product, stock };
        })
      };
    }

    case 'CREATE_USER': {
      const now = nowIso();
      const user: User = {
        ...action.input,
        id: `u-${state.userSeq}`,
        lastActiveAt: null,
        lastActive: '',
        status: action.input.status || 'ACTIVE',
        createdAt: now,
        updatedAt: now
      };
      return { ...state, users: [...state.users, user], userSeq: state.userSeq + 1 };
    }

    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map((u) => (u.id === action.id ? { ...u, ...action.patch, updatedAt: nowIso() } : u))
      };

    case 'DELETE_USER':
      return { ...state, users: state.users.filter((u) => u.id !== action.id) };

    case 'SET_PERMISSION':
      return {
        ...state,
        permissions: {
          ...state.permissions,
          [action.role]: { ...state.permissions[action.role], [action.key]: action.value }
        }
      };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.patch } };

    case 'SET_ALERT_STATUS':
      return {
        ...state,
        alerts: state.alerts.map((a) => (a.id === action.id ? { ...a, status: action.status, updatedAt: nowIso() } : a))
      };

    case 'ADD_ALERT_NOTE':
      return {
        ...state,
        alerts: state.alerts.map((a) =>
          a.id === action.id
            ? {
                ...a,
                notes: [
                  ...a.notes,
                  {
                    id: `n-${a.notes.length + 1}-${Date.now()}`,
                    text: action.text,
                    author: { id: 'u-1', name: 'User', email: 'user@nexpos.app', role: 'ADMIN' },
                    createdAt: nowIso(),
                    updatedAt: nowIso()
                  }
                ],
                updatedAt: nowIso()
              }
            : a
        )
      };

    case 'RUN_ANOMALY_SCAN': {
      const detected = detectAnomalies({
        sales: state.sales,
        movements: state.movements,
        products: state.products,
        purchaseOrders: state.purchaseOrders,
        settings: state.settings
      });
      const existing = new Map(state.alerts.map((a) => [a.id, a]));
      const merged = detected.map((found) => {
        const prior = existing.get(found.id);
        return prior ? { ...found, status: prior.status, notes: prior.notes, createdAt: prior.createdAt } : found;
      });
      const detectedIds = new Set(detected.map((d) => d.id));
      const kept = state.alerts.filter((a) => !a.id.startsWith('auto-') || detectedIds.has(a.id));
      const keptIds = new Set(kept.map((a) => a.id));
      return {
        ...state,
        alerts: [
          ...merged.filter((a) => !keptIds.has(a.id)),
          ...kept.map((a) => merged.find((m) => m.id === a.id) ?? a)
        ]
      };
    }

    case 'SET_PRODUCTS':
      return { ...state, products: action.products };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.categories };
    case 'SET_CATEGORY_TREE':
      return { ...state, categoryTree: action.categoryTree };
    case 'SET_SALES':
      return { ...state, sales: action.sales };
    case 'SET_MOVEMENTS':
      return { ...state, movements: action.movements };
    case 'SET_SUPPLIERS':
      return { ...state, suppliers: action.suppliers };
    case 'SET_PURCHASE_ORDERS':
      return { ...state, purchaseOrders: action.purchaseOrders };
    case 'SET_TRANSFERS':
      return { ...state, transfers: action.transfers };
    case 'SET_ALERTS':
      return { ...state, alerts: action.alerts };
    case 'SET_USERS':
      return { ...state, users: action.users };
    case 'SET_BRANCHES':
      return { ...state, branches: action.branches };
    case 'SET_SETTINGS':
      return { ...state, settings: action.settings };
    case 'SET_PERMISSIONS':
      return { ...state, permissions: action.permissions };

    default:
      return state;
  }
}
