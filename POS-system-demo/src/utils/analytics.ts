import { Product, Sale, CategoryName } from '../types';

export interface DayPoint {
  day: string;
  date: string;
  value: number;
  orders: number;
}

export function dayKey(iso: string): string {
  if (!iso) return '';
  return new Date(iso).toISOString().slice(0, 10);
}

export function dayLabel(iso: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short' });
}

export function withinDays(iso: string, days: number): boolean {
  if (!iso) return false;
  const time = new Date(iso).getTime();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return time >= cutoff;
}

export function completed(sales: Sale[]): Sale[] {
  return sales.filter((s) => s.status === 'COMPLETED' || s.status === ('Completed' as any));
}

export interface SummaryStats {
  revenue: number;
  orders: number;
  avgBasket: number;
  items: number;
  discounts: number;
  voids: number;
  refunds: number;
  refundValue: number;
}

export function summaryStats(sales: Sale[]): SummaryStats {
  const comp = completed(sales);
  const revenue = comp.reduce((sum, s) => sum + s.total, 0);
  const items = comp.reduce((sum, s) => {
    const lines = s.items || s.lines || [];
    return sum + lines.reduce((n: number, l: any) => n + l.quantity, 0);
  }, 0);
  const discounts = comp.reduce((sum, s) => sum + s.discount, 0);
  const voids = sales.filter((s) => s.status === 'VOIDED' || s.status === ('Voided' as any)).length;
  const refundSales = sales.filter((s) => s.status === 'REFUNDED' || s.status === ('Refunded' as any));

  return {
    revenue,
    orders: comp.length,
    avgBasket: comp.length > 0 ? revenue / comp.length : 0,
    items,
    discounts,
    voids,
    refunds: refundSales.length,
    refundValue: refundSales.reduce((sum, s) => sum + s.total, 0)
  };
}

export function revenueSeries(sales: Sale[], days: number): DayPoint[] {
  const buckets = new Map<string, DayPoint>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, { day: dayLabel(d.toISOString()), date: key, value: 0, orders: 0 });
  }
  completed(sales).forEach((sale) => {
    const saleDate = sale.soldAt || sale.createdAt || sale.at || '';
    const bucket = buckets.get(dayKey(saleDate));
    if (!bucket) return;
    bucket.value += sale.total;
    bucket.orders += 1;
  });
  return Array.from(buckets.values()).map((b) => ({ ...b, value: Math.round(b.value) }));
}

export interface ProductPerformance {
  productId: string;
  name: string;
  sku: string;
  units: number;
  revenue: number;
}

export function topProducts(sales: Sale[], limit = 5): ProductPerformance[] {
  const map = new Map<string, ProductPerformance>();
  completed(sales).forEach((sale) => {
    const items = (sale.items || sale.lines || []) as any[];
    items.forEach((line) => {
      const prodId = line.product?.id || line.productId || '';
      const name = line.productNameSnapshot || line.name || '';
      const sku = line.productSkuSnapshot || line.sku || '';
      const price = line.unitPriceAtSale ?? line.unitPrice ?? 0;
      const qty = line.quantity ?? 0;

      const entry = map.get(prodId) ?? {
        productId: prodId,
        name,
        sku,
        units: 0,
        revenue: 0
      };
      entry.units += qty;
      entry.revenue += qty * price;
      map.set(prodId, entry);
    });
  });
  return Array.from(map.values())
    .map((entry) => ({ ...entry, revenue: Math.round(entry.revenue) }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export interface CategorySlice {
  name: string;
  value: number;
  revenue: number;
  units: number;
  color: string;
}

export function categoryBreakdown(sales: Sale[], products: Product[]): CategorySlice[] {
  const lookup = new Map(
    products.map((p) => {
      const catName = typeof p.category === 'object' ? p.category?.name : p.category;
      return [p.id, catName || 'Household'];
    })
  );
  const totals = new Map<string, { revenue: number; units: number }>();
  completed(sales).forEach((sale) => {
    const items = (sale.items || sale.lines || []) as any[];
    items.forEach((line) => {
      const prodId = line.product?.id || line.productId || '';
      const price = line.unitPriceAtSale ?? line.unitPrice ?? 0;
      const qty = line.quantity ?? 0;
      const category = lookup.get(prodId) ?? 'Household';
      const entry = totals.get(category) ?? { revenue: 0, units: 0 };
      entry.revenue += qty * price;
      entry.units += qty;
      totals.set(category, entry);
    });
  });

  const categoryHex: Record<CategoryName, string> = {
    Beverages: '#3B5BFF',
    Snacks: '#0EA5E9',
    Dairy: '#10B981',
    Household: '#F59E0B',
    Bakery: '#EC4899',
    Frozen: '#8B5CF6',
    'Personal Care': '#EC4899',
    Stationery: '#8B5CF6',
    Electronics: '#10B981'
  };

  const totalRev = Array.from(totals.values()).reduce((sum, c) => sum + c.revenue, 0);

  return Array.from(totals.entries()).map(([name, data]) => ({
    name,
    value: totalRev > 0 ? Math.round((data.revenue / totalRev) * 100) : 0,
    revenue: Math.round(data.revenue),
    units: data.units,
    color: categoryHex[name as CategoryName] ?? '#64748b'
  }));
}

export type CashierPerformance = {
  cashier: string;
  orders: number;
  revenue: number;
  avgBasket: number;
  items: number;
  discounts: number;
  voids: number;
  refunds: number;
};
export type CashierRow = CashierPerformance;

export interface StockValuationRow {
  category: string;
  skus: number;
  units: number;
  cost: number;
  retail: number;
  color: string;
}
export type ValuationRow = StockValuationRow;

export function cashierPerformance(sales: Sale[]): CashierPerformance[] {
  const map = new Map<string, CashierPerformance>();

  sales.forEach((sale) => {
    const cashierName =
      typeof sale.cashier === 'object' ? sale.cashier?.name || 'Unknown' : sale.cashier;
    const entry = map.get(cashierName) ?? {
      cashier: cashierName,
      orders: 0,
      revenue: 0,
      avgBasket: 0,
      items: 0,
      discounts: 0,
      voids: 0,
      refunds: 0
    };

    if (sale.status === 'COMPLETED' || sale.status === ('Completed' as any)) {
      entry.orders += 1;
      entry.revenue += sale.total;
      const items = sale.items || sale.lines || [];
      entry.items += items.reduce((n: number, l: any) => n + l.quantity, 0);
      entry.discounts += sale.discount;
    } else if (sale.status === 'VOIDED' || sale.status === ('Voided' as any)) {
      entry.voids += 1;
    } else if (sale.status === 'REFUNDED' || sale.status === ('Refunded' as any)) {
      entry.refunds += 1;
    }

    map.set(cashierName, entry);
  });

  return Array.from(map.values()).map((entry) => ({
    ...entry,
    revenue: Math.round(entry.revenue),
    avgBasket: entry.orders > 0 ? Math.round(entry.revenue / entry.orders) : 0
  }));
}

export interface StockValuationRow {
  category: string;
  skus: number;
  units: number;
  cost: number;
  retail: number;
  color: string;
}

export function stockValuation(products: Product[], branchId?: string): StockValuationRow[] {
  const categoryHex: Record<CategoryName, string> = {
    Beverages: '#3B5BFF',
    Snacks: '#0EA5E9',
    Dairy: '#10B981',
    Household: '#F59E0B',
    Bakery: '#EC4899',
    Frozen: '#8B5CF6',
    'Personal Care': '#EC4899',
    Stationery: '#8B5CF6',
    Electronics: '#10B981'
  };

  const map = new Map<string, StockValuationRow>();

  products.forEach((product) => {
    const catName = typeof product.category === 'object' ? product.category?.name : product.category;
    const unitsCount = branchId
      ? product.stock?.[branchId] ?? 0
      : Object.values(product.stock || {}).reduce((sum, n) => sum + n, 0);

    if (!catName) return;

    const row = map.get(catName) ?? {
      category: catName,
      skus: 0,
      units: 0,
      cost: 0,
      retail: 0,
      color: categoryHex[catName as CategoryName] ?? '#94a3b8'
    };
    row.skus += 1;
    row.units += unitsCount;
    row.cost += unitsCount * (product.costPrice ?? product.cost ?? 0);
    row.retail += unitsCount * (product.unitPrice ?? product.price ?? 0);
    map.set(catName, row);
  });
  return Array.from(map.values())
    .map((row) => ({ ...row, cost: Math.round(row.cost), retail: Math.round(row.retail) }))
    .sort((a, b) => b.retail - a.retail);
}

export interface MarginRow {
  name: string;
  sku: string;
  units: number;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
}

export function marginByProduct(sales: Sale[], products: Product[], limit = 12): MarginRow[] {
  const lookup = new Map(products.map((p) => [p.id, p]));
  const map = new Map<string, MarginRow>();
  completed(sales).forEach((sale) => {
    const items = (sale.items || sale.lines || []) as any[];
    items.forEach((line) => {
      const prodId = line.product?.id || line.productId || '';
      const name = line.productNameSnapshot || line.name || '';
      const sku = line.productSkuSnapshot || line.sku || '';
      const price = line.unitPriceAtSale ?? line.unitPrice ?? 0;
      const qty = line.quantity ?? 0;
      const product = lookup.get(prodId);

      const row = map.get(prodId) ?? {
        name,
        sku,
        units: 0,
        revenue: 0,
        cost: 0,
        profit: 0,
        margin: 0
      };
      row.units += qty;
      row.revenue += qty * price;
      const c = product ? (product.costPrice ?? product.cost ?? price * 0.7) : price * 0.7;
      row.cost += qty * c;
      map.set(prodId, row);
    });
  });
  return Array.from(map.values())
    .map((row) => {
      const revenue = Math.round(row.revenue);
      const cost = Math.round(row.cost);
      const profit = revenue - cost;
      return { ...row, revenue, cost, profit, margin: revenue ? (profit / revenue) * 100 : 0 };
    })
    .sort((a, b) => b.profit - a.profit)
    .slice(0, limit);
}