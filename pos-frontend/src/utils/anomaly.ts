import {
  AnomalyAlert,
  AnomalySeverity,
  Product,
  PurchaseOrder,
  Sale,
  StockMovement,
  StoreSettings
} from '../types';
import { branches } from '../data/branches';
import { withinDays } from './analytics';

export interface ScanInput {
  sales: Sale[];
  movements: StockMovement[];
  products: Product[];
  purchaseOrders: PurchaseOrder[];
  settings: StoreSettings;
}

const SENSITIVITY: Record<string, number> = {
  LOW: 1.5,
  BALANCED: 1.0,
  HIGH: 0.6,
  Low: 1.5,
  Balanced: 1.0,
  High: 0.6
};

function branchName(slugOrId: string): string {
  const match = branches.find((b) => b.slug === slugOrId || b.id === slugOrId);
  return match?.name ?? slugOrId;
}

function alert(
  id: string,
  title: string,
  explanation: string,
  severity: AnomalySeverity,
  branchLabel: string,
  windowDescription: string,
  relatedEntityLabel: string,
  metricDescription: string
): AnomalyAlert {
  const at = new Date().toISOString();
  return {
    id,
    title,
    explanation,
    severity,
    status: 'NEW',
    branch: branchLabel,
    windowDescription,
    relatedEntityLabel,
    metricDescription,
    window: windowDescription,
    related: relatedEntityLabel,
    metric: metricDescription,
    notes: [],
    createdAt: at,
    updatedAt: at,
    at
  };
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

/**
 * Re-runs the fraud/shrinkage heuristics against the live ledger.
 * Ids are deterministic so a repeated scan updates rather than duplicates.
 */
export function detectAnomalies(input: ScanInput): AnomalyAlert[] {
  const { sales, movements, products, settings } = input;
  const factor = SENSITIVITY[settings.alertSensitivity] ?? 1;
  const found: AnomalyAlert[] = [];
  const recent = sales.filter((s) => {
    const saleDate = s.soldAt || s.createdAt || (s as any).at || '';
    return saleDate ? withinDays(saleDate, 7) : false;
  });

  // 1. Void concentration by cashier
  const voidsBy = new Map<string, Sale[]>();
  recent
    .filter((s) => s.status === 'VOIDED' || s.status === ('Voided' as any))
    .forEach((s) => {
      const cName = typeof s.cashier === 'object' ? s.cashier.name : s.cashier;
      voidsBy.set(cName, [...(voidsBy.get(cName) ?? []), s]);
    });
  voidsBy.forEach((list, cashier) => {
    if (list.length < Math.max(2, Math.round(3 * factor))) return;
    const branchKey = typeof list[0].branch === 'string' ? list[0].branch : (list[0].branch as any)?.slug || (list[0] as any).branchSlug || '';
    found.push(
      alert(
        `auto-void-${slug(cashier)}`,
        `Elevated void rate — ${cashier}`,
        `${list.length} voided sales in the last 7 days, above the ${Math.round(3 * factor)}-void review threshold.`,
        list.length >= 5 ? 'HIGH' : 'MEDIUM',
        branchName(branchKey),
        'Last 7 days',
        cashier,
        `${list.length} voids`
      )
    );
  });

  // 2. Discounts hugging the approval ceiling
  const nearLimit = recent.filter((s) => {
    if (s.discount <= 0 || s.subtotal <= 0) return false;
    const pct = (s.discount / s.subtotal) * 100;
    return pct >= settings.maxDiscountPercent - 1 && pct <= settings.maxDiscountPercent;
  });
  if (nearLimit.length >= Math.max(3, Math.round(6 * factor))) {
    found.push(
      alert(
        'auto-discount-threshold',
        'Discount pattern hugging the approval limit',
        `${nearLimit.length} sales discounted just below the ${settings.maxDiscountPercent}% manager-approval limit.`,
        'MEDIUM',
        'All branches',
        'Last 7 days',
        'Discount policy',
        `${nearLimit.length} sales`
      )
    );
  }

  // 3. Repeated negative manual adjustments per product
  const shrink = new Map<string, { qty: number; count: number; branch: string }>();
  movements
    .filter((m) => {
      const mDate = m.createdAt || (m as any).at || '';
      return m.type === 'ADJUSTMENT' && (m.quantity ?? m.qty) < 0 && mDate && withinDays(mDate, 14);
    })
    .forEach((m) => {
      const prodId = typeof m.product === 'object' ? m.product.id : m.productId;
      const branchKey = typeof m.branch === 'string' ? m.branch : (m as any).branch?.slug || (m as any).branchSlug || '';
      const q = m.quantity ?? m.qty;
      const entry = shrink.get(prodId) ?? { qty: 0, count: 0, branch: branchKey };
      entry.qty += q;
      entry.count += 1;
      shrink.set(prodId, entry);
    });
  shrink.forEach((entry, productId) => {
    if (entry.count < Math.max(2, Math.round(3 * factor))) return;
    const product = products.find((p) => p.id === productId);
    found.push(
      alert(
        `auto-shrink-${productId}`,
        `Repeated stock write-offs — ${product?.name ?? productId}`,
        `${entry.count} negative adjustments totalling ${entry.qty} units in the last 14 days.`,
        Math.abs(entry.qty) >= 15 ? 'HIGH' : 'MEDIUM',
        branchName(entry.branch),
        'Last 14 days',
        product?.name ?? productId,
        `${entry.qty} units · ${entry.count} entries`
      )
    );
  });

  // 4. Fast movers sitting at zero stock
  const soldUnits = new Map<string, number>();
  recent
    .filter((s) => s.status === 'COMPLETED' || s.status === ('Completed' as any))
    .forEach((s) => {
      const items = (s.items || s.lines || []) as any[];
      items.forEach((l) => {
        const prodId = l.product?.id || l.productId || '';
        if (prodId) {
          soldUnits.set(prodId, (soldUnits.get(prodId) ?? 0) + (l.quantity ?? 0));
        }
      });
    });
  products.forEach((product) => {
    const sold = soldUnits.get(product.id) ?? 0;
    const total = Object.values(product.stock || {}).reduce((sum, n) => sum + n, 0);
    if (!product.active || total > 0 || sold < Math.max(6, Math.round(15 * factor))) return;
    found.push(
      alert(
        `auto-stockout-${product.id}`,
        `Fast mover out of stock — ${product.name}`,
        `${sold} units sold in the last 7 days and every branch is now at zero on hand.`,
        'HIGH',
        'All branches',
        'Last 7 days',
        product.name,
        `${sold} units sold · 0 on hand`
      )
    );
  });

  // 5. Refund value spikes by branch
  const refundBy = new Map<string, { value: number; count: number }>();
  recent
    .filter((s) => s.status === 'REFUNDED' || s.status === ('Refunded' as any))
    .forEach((s) => {
      const branchKey = typeof s.branch === 'string' ? s.branch : (s as any).branch?.slug || (s as any).branchSlug || '';
      const entry = refundBy.get(branchKey) ?? { value: 0, count: 0 };
      entry.value += s.total;
      entry.count += 1;
      refundBy.set(branchKey, entry);
    });
  refundBy.forEach((entry, branchKey) => {
    if (entry.count < Math.max(2, Math.round(4 * factor))) return;
    found.push(
      alert(
        `auto-refund-${branchKey}`,
        `Refund volume above normal — ${branchName(branchKey)}`,
        `${entry.count} refunds worth Rs. ${Math.round(entry.value).toLocaleString()} in the last 7 days.`,
        entry.count >= 6 ? 'HIGH' : 'MEDIUM',
        branchName(branchKey),
        'Last 7 days',
        'Refund policy',
        `Rs. ${Math.round(entry.value).toLocaleString()} (${entry.count} sales)`
      )
    );
  });

  return found;
}