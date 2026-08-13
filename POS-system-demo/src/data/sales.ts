import { CartLine, PaymentMethod, Sale, SaleStatus, BranchId, SaleItem, Payment } from '../types';
import { seedProducts, TAX_RATE } from './products';
import { branchIds } from './branches';
import { daysAgo } from '../utils/time';
import { categoryBreakdown, revenueSeries, topProducts } from '../utils/analytics';

function ln(sku: string, quantity: number): CartLine {
  const product = seedProducts.find((p) => p.sku === sku)!;
  return {
    productId: product.id,
    name: product.name,
    sku: product.sku,
    unitPrice: product.unitPrice,
    quantity
  };
}

export function buildSale(
  id: string,
  soldAt: string,
  branch: BranchId,
  cashierName: string,
  paymentMethod: PaymentMethod,
  status: SaleStatus,
  lines: CartLine[],
  discount = 0
): Sale {
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const taxable = Math.max(subtotal - discount, 0);
  const tax = Math.round(taxable * TAX_RATE * 100) / 100;
  const total = Math.round((taxable + tax) * 100) / 100;

  const items: SaleItem[] = lines.map((l, idx) => ({
    id: `item-${id}-${idx}`,
    product: { id: l.productId, sku: l.sku, name: l.name },
    productNameSnapshot: l.name,
    productSkuSnapshot: l.sku,
    quantity: l.quantity,
    unitPriceAtSale: l.unitPrice,
    discount: 0,
    lineTotal: l.unitPrice * l.quantity,
    createdAt: soldAt,
    updatedAt: soldAt
  }));

  const payments: Payment[] = [
    {
      id: `pay-${id}-1`,
      method: paymentMethod,
      amount: total,
      tenderedAmount: paymentMethod === 'CASH' ? Math.ceil(total / 100) * 100 : null,
      createdAt: soldAt,
      updatedAt: soldAt
    }
  ];

  const branchNames: Record<string, string> = {
    colombo: 'Colombo – Main Branch',
    kandy: 'Kandy Branch',
    galle: 'Galle Branch',
    negombo: 'Negombo Branch',
    matara: 'Matara Branch'
  };
  const branchSummary = { id: `branch-${branch}`, slug: branch, name: branchNames[branch] || branch };
  const cashierSummary = { id: `u-${cashierName.replace(/\s+/g, '-').toLowerCase()}`, name: cashierName, email: `${cashierName.toLowerCase().replace(/\s+/g, '.')}@nexpos.lk`, role: 'CASHIER' };

  return {
    id: `550e8400-e29b-41d4-a716-${id.replace('SALE-', '44665544')}`,
    receiptNumber: id,
    branch: branchSummary,
    cashier: cashierSummary,
    terminalId: 'terminal-1',
    status,
    soldAt,
    subtotal,
    discount,
    tax,
    total,
    note: null,
    items,
    payments,
    lines,
    tendered: payments[0].tenderedAmount ?? total,
    payment: paymentMethod,
    createdAt: soldAt,
    updatedAt: soldAt
  };
}

function mulberry32(seed: number) {
  let a = seed;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const cashiersByBranch: Record<string, string[]> = {
  colombo: ['Nadeesha Perera', 'Kasun Fernando', 'Anushka Weerasinghe', 'Tharaka Kumara', 'Sithara Mendis'],
  kandy: ['Ishara Jayasuriya', 'Ruwan Silva', 'Prasad Abeysekara', 'Kavindra Rajakaruna'],
  galle: ['Dilhani Wickrama', 'Ruwan Silva', 'Thilina Gamage'],
  negombo: ['Chamara Bandara', 'Sanduni Athukorala', 'Asela Jayaratne'],
  matara: ['Prabha Seneviratne', 'Nishantha Priyantha']
};

// Sri Lanka specific day weights — high on weekends, slightly lower mid-week
const DAY_WEIGHT = [1.42, 1.35, 0.85, 0.92, 1.02, 1.18, 1.38]; // Sun,Mon,Tue,Wed,Thu,Fri,Sat
const rand = mulberry32(20260810);

// Use active products from all categories
const pool = seedProducts.filter((p) => p.active);

function generateHistory(): { sales: Sale[]; nextSeq: number } {
  const sales: Sale[] = [];
  let seq = 10140;

  // Generate 90 days of history
  for (let d = 89; d >= 0; d--) {
    const dayOfWeek = (new Date(Date.now() - d * 86400000)).getDay();
    const weight = DAY_WEIGHT[dayOfWeek];

    branchIds.forEach((branch) => {
      // Different transaction volumes by branch size
      const base = branch === 'colombo' ? 18 : branch === 'kandy' ? 14 : branch === 'negombo' ? 12 : branch === 'galle' ? 10 : 7;
      const count = Math.max(4, Math.round((base + rand() * 6) * weight));
      const cashiers = cashiersByBranch[branch] ?? ['Nadeesha Perera'];

      for (let i = 0; i < count; i++) {
        const hour = 8 + Math.floor(rand() * 13); // 8 AM - 9 PM
        if (d === 0 && hour > 16) continue; // today cut at 4 PM for demo
        const minute = Math.floor(rand() * 60);
        const lineCount = 1 + Math.floor(rand() * 5);
        const lines: CartLine[] = [];

        for (let j = 0; j < lineCount; j++) {
          const product = pool[Math.floor(rand() * pool.length)];
          if (lines.some((l) => l.productId === product.id)) continue;
          lines.push({
            productId: product.id,
            name: product.name,
            sku: product.sku,
            unitPrice: product.unitPrice,
            quantity: 1 + Math.floor(rand() * 4)
          });
        }

        if (lines.length === 0) continue;

        const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
        // ~18% of sales get a discount
        const discount = rand() < 0.18 ? Math.round((subtotal * (0.03 + rand() * 0.07)) / 10) * 10 : 0;

        const statusRoll = rand();
        const status: SaleStatus =
          statusRoll < 0.025 ? 'VOIDED' : statusRoll < 0.05 ? 'REFUNDED' : 'COMPLETED';

        const payRoll = rand();
        // Sri Lanka: ~45% cash, ~40% card, ~15% split
        const payment: PaymentMethod = payRoll < 0.45 ? 'CASH' : payRoll < 0.85 ? 'CARD' : 'SPLIT';

        sales.push(
          buildSale(
            `SALE-${seq++}`,
            daysAgo(d, hour, minute),
            branch,
            cashiers[Math.floor(rand() * cashiers.length)],
            payment,
            status,
            lines,
            discount
          )
        );
      }
    });
  }

  return { sales: sales.sort((a, b) => (a.soldAt < b.soldAt ? 1 : -1)), nextSeq: seq };
}

const history = generateHistory();

export const seedSales: Sale[] = history.sales;
export const nextSaleSeq: number = history.nextSeq;

export const salesTrend14Days = revenueSeries(seedSales, 14).map((point) => ({
  day: point.day,
  value: point.value
}));

export const revenueByDay = revenueSeries(seedSales, 12).map((point) => ({
  day: point.day,
  value: point.value
}));

export const sparkline = revenueSeries(seedSales, 7).map((point) => ({
  v: Math.round(point.value / 1000)
}));

export const topSellingProducts = topProducts(seedSales, 5).map((entry) => ({
  name: entry.name,
  units: entry.units,
  revenue: entry.revenue
}));

export const salesByCategory = categoryBreakdown(seedSales, seedProducts).map((slice) => ({
  name: slice.name,
  value: slice.value,
  color: slice.color
}));

export const reorderSuggestions = [
  {
    product: 'Anchor Full Cream Milk 1L',
    sku: 'DRY-AN-1000',
    suggested: 60,
    reason: 'Sales velocity up 38% this week — Colombo branch critical'
  },
  {
    product: 'Maliban Chocolate Puff 200g',
    sku: 'SNK-MB-200',
    suggested: 48,
    reason: 'Below reorder threshold for 4 consecutive days'
  },
  {
    product: 'Kotmale Cheddar Cheese 200g',
    sku: 'DRY-KC-200',
    suggested: 24,
    reason: 'Out of stock in Colombo — 14 missed sales this week'
  },
  {
    product: 'Sandwich Bread Loaf 450g',
    sku: 'BAK-SB-450',
    suggested: 80,
    reason: 'Daily staple, sells out by 3 PM on weekdays'
  },
  {
    product: 'Coca-Cola 400ml',
    sku: 'BEV-CC-400',
    suggested: 240,
    reason: 'Upcoming festive season demand spike expected'
  }
];

export { ln as saleLine };
