import { StoreState, PosAction } from './storeState';
import { applyStock, movement, computeTotals, stockAt } from './storeState';
import { Product, Sale, SaleItem, Payment } from '../types';

export function posReducer(state: StoreState, action: PosAction): StoreState {
  switch (action.type) {
    case 'SET_BRANCH':
      return {
        ...state,
        branch: action.branch
      };

    case 'ADD_TO_CART': {
      const existing = state.cart.find((line) => line.productId === action.product.id);
      const price = action.product.unitPrice ?? action.product.price ?? 0;
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((line) =>
            line.productId === action.product.id
              ? { ...line, quantity: line.quantity + action.quantity }
              : line
          )
        };
      }
      return {
        ...state,
        cart: [
          ...state.cart,
          {
            productId: action.product.id,
            name: action.product.name,
            sku: action.product.sku,
            unitPrice: price,
            quantity: action.quantity
          }
        ]
      };
    }

    case 'SET_LINE_QTY': {
      if (action.quantity <= 0) {
        return {
          ...state,
          cart: state.cart.filter((line) => line.productId !== action.productId)
        };
      }
      return {
        ...state,
        cart: state.cart.map((line) =>
          line.productId === action.productId ? { ...line, quantity: action.quantity } : line
        )
      };
    }

    case 'REMOVE_LINE':
      return {
        ...state,
        cart: state.cart.filter((line) => line.productId !== action.productId)
      };

    case 'CLEAR_CART':
      return {
        ...state,
        cart: [],
        discount: 0
      };

    case 'SET_DISCOUNT':
      return {
        ...state,
        discount: action.discount
      };

    case 'SET_PAYMENT':
      return {
        ...state,
        payment: action.payment
      };

    case 'HOLD_SALE': {
      if (state.cart.length === 0) return state;
      const id = `held-${Date.now()}`;
      const now = new Date().toISOString();
      const first = state.cart[0].name;
      const extra = state.cart.length > 1 ? ` +${state.cart.length - 1} more` : '';
      return {
        ...state,
        held: [
          ...state.held,
          {
            id,
            label: `${first}${extra}`,
            heldAt: now,
            discount: state.discount,
            items: state.cart.map((l, i) => ({
              id: `${id}-item-${i}`,
              product: { id: l.productId, sku: l.sku, name: l.name },
              productNameSnapshot: l.name,
              productSkuSnapshot: l.sku,
              unitPrice: l.unitPrice,
              quantity: l.quantity,
              createdAt: now,
              updatedAt: now
            })),
            lines: state.cart
          }
        ],
        cart: [],
        discount: 0
      };
    }

    case 'RESUME_HELD': {
      const target = state.held.find((h) => h.id === action.id);
      if (!target) return state;
      return {
        ...state,
        cart: target.lines,
        discount: target.discount,
        held: state.held.filter((h) => h.id !== action.id)
      };
    }

    case 'DISCARD_HELD':
      return {
        ...state,
        held: state.held.filter((h) => h.id !== action.id)
      };

    case 'COMPLETE_SALE': {
      if (state.cart.length === 0) return state;

      if (action.payload) {
        return {
          ...state,
          cart: [],
          discount: 0,
          payment: 'CASH',
          lastSale: action.payload,
          saleSeq: state.saleSeq + 1
        };
      }

      const at = new Date().toISOString();
      const num = Math.floor(1000 + Math.random() * 9000);
      const uuid = '00000000-0000-4000-8000-' + Date.now().toString().padStart(12, '0');
      const receiptNumber = `REC-${num}`;
      const taxRate = state.settings.taxRate / 100;
      const totals = computeTotals(state.cart, state.discount, taxRate);

      const items: SaleItem[] = state.cart.map((l, i) => ({
        id: `si-${receiptNumber}-${i + 1}`,
        product: { id: l.productId, sku: l.sku, name: l.name },
        productNameSnapshot: l.name,
        productSkuSnapshot: l.sku,
        quantity: l.quantity,
        unitPriceAtSale: l.unitPrice,
        discount: 0,
        lineTotal: l.unitPrice * l.quantity,
        createdAt: at,
        updatedAt: at
      }));

      const payments: Payment[] = [
        {
          id: `pay-${receiptNumber}-1`,
          method: state.payment,
          amount: totals.total,
          tenderedAmount: state.payment === 'CASH' ? action.tendered ?? totals.total : null,
          createdAt: at,
          updatedAt: at
        }
      ];

      const currentBranch = state.branches.find((b) => b.slug === state.branch || b.id === state.branch);
      const branchSummary = currentBranch ? { id: currentBranch.id, slug: currentBranch.slug, name: currentBranch.name } : { id: `branch-${state.branch}`, slug: state.branch, name: state.branch };

      const sale: Sale = {
        id: uuid,
        receiptNumber,
        soldAt: at,
        at,
        branch: branchSummary,
        cashier: { id: 'u-4', name: 'Nadeesha Perera', email: 'nadeesha.p@nexpos.app', role: 'CASHIER' },
        terminalId: 'terminal-1',
        payment: state.payment,
        status: 'COMPLETED',
        items,
        payments,
        lines: state.cart,
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: totals.tax,
        total: totals.total,
        note: null,
        tendered: action.tendered,
        createdAt: at,
        updatedAt: at
      };

      let products = state.products;
      const newMovements = state.cart.map((line, index) => {
        products = applyStock(products, line.productId, state.branch, line.quantity * -1, at);
        return movement(
          state.saleSeq + index,
          line.productId,
          state.branch,
          'SALE',
          line.quantity * -1,
          receiptNumber,
          `POS Sale ${receiptNumber}`,
          at
        );
      });

      if (!state.online) {
        return {
          ...state,
          sales: [sale, ...state.sales],
          queuedSales: [...state.queuedSales, sale],
          movements: [...newMovements, ...state.movements],
          products,
          cart: [],
          discount: 0,
          lastSale: sale,
          saleSeq: state.saleSeq + 1
        };
      }

      return {
        ...state,
        sales: [sale, ...state.sales],
        movements: [...newMovements, ...state.movements],
        products,
        cart: [],
        discount: 0,
        lastSale: sale,
        saleSeq: state.saleSeq + 1
      };
    }

    case 'CLEAR_LAST_SALE':
      return {
        ...state,
        lastSale: null
      };

    case 'ADJUST_STOCK': {
      const { productId, branchId, quantity, reason } = action.input;
      const at = new Date().toISOString();
      const product = state.products.find((p) => p.id === productId);
      if (!product) return state;

      const current = stockAt(product, branchId);
      const delta = quantity - current;

      const newMovement = movement(
        state.adjSeq,
        productId,
        branchId,
        'ADJUSTMENT',
        delta,
        `ADJ-${Math.floor(1000 + Math.random() * 9000)}`,
        reason,
        at
      );

      return {
        ...state,
        products: applyStock(state.products, productId, branchId, delta, at),
        movements: [newMovement, ...state.movements],
        adjSeq: state.adjSeq + 1
      };
    }

    case 'SAVE_PRODUCT':
      return {
        ...state,
        products: state.products.map((p) => (p.id === action.product.id ? action.product : p))
      };

    case 'CREATE_PRODUCT': {
      const at = new Date().toISOString();
      const id = `p-${Date.now()}`;
      const product: Product = {
        ...action.product,
        id,
        createdAt: at,
        updatedAt: at
      };
      return {
        ...state,
        products: [product, ...state.products]
      };
    }

    case 'DUPLICATE_PRODUCT': {
      const original = state.products.find((p) => p.id === action.id);
      if (!original) return state;
      const at = new Date().toISOString();
      const copy: Product = {
        ...original,
        id: `p-${Date.now()}`,
        name: `${original.name} (Copy)`,
        sku: `${original.sku}-COPY`,
        barcode: String(Math.floor(4790000000000 + Math.random() * 9999999)),
        active: false,
        createdAt: at,
        updatedAt: at
      };
      return {
        ...state,
        products: [copy, ...state.products]
      };
    }

    case 'TOGGLE_ACTIVE':
      return {
        ...state,
        products: state.products.map((p) => (p.id === action.id ? { ...p, active: !p.active } : p))
      };

    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.id),
        cart: state.cart.filter((l) => l.productId !== action.id)
      };

    case 'TOGGLE_ONLINE':
      return {
        ...state,
        online: !state.online,
        queuedSales: state.online ? state.queuedSales : []
      };

    default:
      return state;
  }
}
