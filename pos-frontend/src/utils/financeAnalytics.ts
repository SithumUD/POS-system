import { Sale, Product, Branch, StoreSettings } from '../types';
import { completed } from './analytics';

export interface FinancialPnL {
  grossSales: number;
  discounts: number;
  netSales: number;
  cogs: number;
  grossProfit: number;
  grossMarginPct: number;
  operatingExpenses: number; // estimated rent, utilities, staff allocation
  operatingIncome: number;
  taxAmount: number;
  netIncome: number;
  netMarginPct: number;
}

export interface BranchFinancial {
  branchId: string;
  branchName: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  marginPct: number;
  orderCount: number;
  stockValue: number;
  avgOrderValue: number;
}

export interface PaymentBreakdown {
  method: string;
  totalAmount: number;
  percentage: number;
  transactionCount: number;
}

export function computePnL(sales: Sale[], products: Product[], settings: StoreSettings): FinancialPnL {
  const comp = completed(sales);
  const lookup = new Map(products.map((p) => [p.id, p]));

  let grossSales = 0;
  let discounts = 0;
  let cogs = 0;

  comp.forEach((sale) => {
    discounts += sale.discount || 0;
    const items = (sale.items || sale.lines || []) as any[];
    items.forEach((item) => {
      const prodId = item.product?.id || item.productId || '';
      const price = item.unitPriceAtSale ?? item.unitPrice ?? 0;
      const qty = item.quantity ?? 0;
      const prod = lookup.get(prodId);
      const unitCost = prod ? (prod.costPrice ?? prod.cost ?? price * 0.7) : price * 0.7;

      grossSales += price * qty;
      cogs += unitCost * qty;
    });
  });

  const netSales = Math.max(0, grossSales - discounts);
  const grossProfit = netSales - cogs;
  const grossMarginPct = netSales > 0 ? (grossProfit / netSales) * 100 : 0;

  // Estimate operational expenses (approx 18% of net sales for retail overhead)
  const operatingExpenses = Math.round(netSales * 0.18);
  const operatingIncome = grossProfit - operatingExpenses;

  // Tax calculation
  const taxRate = (settings.taxRate || 10) / 100;
  const taxAmount = Math.round(netSales * (taxRate / (1 + taxRate)));
  const netIncome = operatingIncome - (operatingIncome > 0 ? operatingIncome * 0.15 : 0);
  const netMarginPct = netSales > 0 ? (netIncome / netSales) * 100 : 0;

  return {
    grossSales: Math.round(grossSales),
    discounts: Math.round(discounts),
    netSales: Math.round(netSales),
    cogs: Math.round(cogs),
    grossProfit: Math.round(grossProfit),
    grossMarginPct: Number(grossMarginPct.toFixed(1)),
    operatingExpenses,
    operatingIncome: Math.round(operatingIncome),
    taxAmount,
    netIncome: Math.round(netIncome),
    netMarginPct: Number(netMarginPct.toFixed(1))
  };
}

export function computeBranchFinancials(
  sales: Sale[],
  products: Product[],
  branches: Branch[]
): BranchFinancial[] {
  const lookup = new Map(products.map((p) => [p.id, p]));
  const branchMap = new Map<string, { revenue: number; cogs: number; orderCount: number }>();

  branches.forEach((b) => {
    branchMap.set(b.id, { revenue: 0, cogs: 0, orderCount: 0 });
    if (b.slug) branchMap.set(b.slug, { revenue: 0, cogs: 0, orderCount: 0 });
  });

  completed(sales).forEach((sale) => {
    const bKey = !sale?.branch
      ? ''
      : typeof sale.branch === 'string'
      ? sale.branch
      : sale.branch?.slug || sale.branch?.id || '';
    const entry = branchMap.get(bKey) ?? { revenue: 0, cogs: 0, orderCount: 0 };
    entry.revenue += sale.total;
    entry.orderCount += 1;

    const items = (sale.items || sale.lines || []) as any[];
    items.forEach((item) => {
      const prodId = item.product?.id || item.productId || '';
      const price = item.unitPriceAtSale ?? item.unitPrice ?? 0;
      const qty = item.quantity ?? 0;
      const prod = lookup.get(prodId);
      const unitCost = prod ? (prod.costPrice ?? prod.cost ?? price * 0.7) : price * 0.7;
      entry.cogs += unitCost * qty;
    });

    branchMap.set(bKey, entry);
  });

  return branches.map((b) => {
    const data = branchMap.get(b.id) || branchMap.get(b.slug) || { revenue: 0, cogs: 0, orderCount: 0 };
    const rev = Math.round(data.revenue);
    const cogsVal = Math.round(data.cogs);
    const grossProfit = rev - cogsVal;
    const marginPct = rev > 0 ? (grossProfit / rev) * 100 : 0;

    const stockValue = Object.entries(b.id ? { [b.id]: 0 } : {}).reduce((acc) => acc, 0) ||
      products.reduce((sum, p) => {
        const q = p.stock?.[b.slug] ?? p.stock?.[b.id] ?? 0;
        const c = p.costPrice ?? p.cost ?? 0;
        return sum + q * c;
      }, 0);

    return {
      branchId: b.id,
      branchName: b.name,
      revenue: rev,
      cogs: cogsVal,
      grossProfit,
      marginPct: Number(marginPct.toFixed(1)),
      orderCount: data.orderCount,
      stockValue: Math.round(stockValue),
      avgOrderValue: data.orderCount > 0 ? Math.round(rev / data.orderCount) : 0
    };
  });
}

export function computePaymentBreakdown(sales: Sale[]): PaymentBreakdown[] {
  const comp = completed(sales);
  const totalRev = comp.reduce((sum, s) => sum + s.total, 0);

  const methods: Record<string, { total: number; count: number }> = {
    CASH: { total: 0, count: 0 },
    CARD: { total: 0, count: 0 },
    SPLIT: { total: 0, count: 0 }
  };

  comp.forEach((s) => {
    const payMethod = s.payments?.[0]?.method || s.payment || 'CASH';
    const normKey = payMethod.toUpperCase() === 'CASH' ? 'CASH' : payMethod.toUpperCase() === 'CARD' ? 'CARD' : 'SPLIT';
    methods[normKey].total += s.total;
    methods[normKey].count += 1;
  });

  return Object.entries(methods).map(([method, val]) => ({
    method: method === 'CASH' ? 'Cash Payments' : method === 'CARD' ? 'Card / Terminal' : 'Split / Credit',
    totalAmount: Math.round(val.total),
    percentage: totalRev > 0 ? Number(((val.total / totalRev) * 100).toFixed(1)) : 0,
    transactionCount: val.count
  }));
}

export function computeDailyFinancialSeries(sales: Sale[], products: Product[], days: number) {
  const lookup = new Map(products.map((p) => [p.id, p]));
  const buckets = new Map<string, { date: string; label: string; revenue: number; cogs: number; profit: number }>();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    buckets.set(key, { date: key, label, revenue: 0, cogs: 0, profit: 0 });
  }

  completed(sales).forEach((s) => {
    const dateStr = s.soldAt || s.createdAt || (s as any).at || '';
    if (!dateStr) return;
    const key = new Date(dateStr).toISOString().slice(0, 10);
    const bucket = buckets.get(key);
    if (!bucket) return;

    bucket.revenue += s.total;
    const items = (s.items || s.lines || []) as any[];
    let saleCogs = 0;
    items.forEach((item) => {
      const prodId = item.product?.id || item.productId || '';
      const price = item.unitPriceAtSale ?? item.unitPrice ?? 0;
      const qty = item.quantity ?? 0;
      const prod = lookup.get(prodId);
      const unitCost = prod ? (prod.costPrice ?? prod.cost ?? price * 0.7) : price * 0.7;
      saleCogs += unitCost * qty;
    });
    bucket.cogs += saleCogs;
    bucket.profit += s.total - saleCogs;
  });

  return Array.from(buckets.values()).map((b) => ({
    ...b,
    revenue: Math.round(b.revenue),
    cogs: Math.round(b.cogs),
    profit: Math.round(b.profit)
  }));
}
