import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { DownloadIcon } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Segmented } from '../components/ui/Toolbar';
import { Th, Td, Tr } from '../components/ui/Table';
import { StatCard } from '../components/reports/StatCard';
import { StockValuationReport } from '../components/reports/StockValuationReport';
import { ProfitMarginReport } from '../components/reports/ProfitMarginReport';
import { CashierReport } from '../components/reports/CashierReport';
import { AskYourData } from '../components/reports/AskYourData';
import { useStore } from '../contexts/StoreContext';
import { formatCurrency, formatNumber } from '../utils/currency';
import { downloadCsv, stamp } from '../utils/csv';
import {
  cashierPerformance,
  categoryBreakdown,
  marginByProduct,
  revenueSeries,
  stockValuation,
  summaryStats,
  topProducts,
  withinDays
} from '../utils/analytics';

const tabs = [
  { label: 'Sales Summary' },
  { label: 'Stock Valuation' },
  { label: 'Profit Margin' },
  { label: 'Cashier Performance' }
];

const ranges = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 14 days', days: 14 },
  { label: 'Last 30 days', days: 30 }
];

const selectClass =
  'h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 focus:border-brand-500 focus:outline-none';

function getBranchKey(b: any): string {
  if (!b) return '';
  if (typeof b === 'string') return b;
  return b.slug || b.id || '';
}

export function Reports() {
  const { sales, products, branches, branchLabel } = useStore();
  const [tab, setTab] = useState('Sales Summary');
  const [branch, setBranch] = useState('all');
  const [range, setRange] = useState('Last 7 days');

  const days = ranges.find((r) => r.label === range)?.days ?? 7;
  const scopeLabel = branch === 'all' ? 'All branches' : branchLabel(branch);

  const scoped = useMemo(
    () =>
      sales.filter((sale) => {
        const bKey = getBranchKey(sale.branch);
        const soldTime = sale.soldAt || sale.createdAt || (sale as any).at || '';
        return (branch === 'all' || bKey === branch || sale.branch === branch) && withinDays(soldTime, days);
      }),
    [sales, branch, days]
  );

  const previous = useMemo(
    () =>
      sales.filter((sale) => {
        const bKey = getBranchKey(sale.branch);
        const soldTime = sale.soldAt || sale.createdAt || (sale as any).at || '';
        return (
          (branch === 'all' || bKey === branch || sale.branch === branch) &&
          withinDays(soldTime, days * 2) &&
          !withinDays(soldTime, days)
        );
      }),
    [sales, branch, days]
  );

  const stats = summaryStats(scoped);
  const priorStats = summaryStats(previous);
  const delta = (now: number, before: number) =>
    before === 0 ? (now > 0 ? 100 : 0) : ((now - before) / before) * 100;

  const series = useMemo(() => revenueSeries(scoped, days), [scoped, days]);
  const categories = useMemo(() => categoryBreakdown(scoped, products), [scoped, products]);
  const top = useMemo(() => topProducts(scoped, 8), [scoped]);
  const valuation = useMemo(
    () => stockValuation(products, branch === 'all' ? undefined : branch),
    [products, branch]
  );
  const margins = useMemo(() => marginByProduct(scoped, products, 12), [scoped, products]);
  const cashiers = useMemo(() => cashierPerformance(scoped), [scoped]);

  function exportCurrent() {
    const scope = branch === 'all' ? 'all-branches' : branch;
    if (tab === 'Sales Summary') {
      downloadCsv(`sales-summary-${scope}-${stamp()}`, [
        ['Day', 'Revenue', 'Orders'],
        ...series.map((point) => [point.day, point.value, point.orders])
      ]);
    } else if (tab === 'Stock Valuation') {
      downloadCsv(`stock-valuation-${scope}-${stamp()}`, [
        ['Category', 'SKUs', 'Units', 'Cost value', 'Retail value'],
        ...valuation.map((row) => [row.category, row.skus, row.units, row.cost, row.retail])
      ]);
    } else if (tab === 'Profit Margin') {
      downloadCsv(`profit-margin-${scope}-${stamp()}`, [
        ['Product', 'SKU', 'Units', 'Revenue', 'Cost', 'Profit', 'Margin %'],
        ...margins.map((row) => [
          row.name,
          row.sku,
          row.units,
          row.revenue,
          row.cost,
          row.profit,
          row.margin.toFixed(1)
        ])
      ]);
    } else {
      downloadCsv(`cashier-performance-${scope}-${stamp()}`, [
        ['Cashier', 'Orders', 'Revenue', 'Avg basket', 'Items', 'Discounts', 'Voids', 'Refunds'],
        ...cashiers.map((row) => [
          row.cashier,
          row.orders,
          row.revenue,
          row.avgBasket,
          row.items,
          row.discounts,
          row.voids,
          row.refunds
        ])
      ]);
    }
    toast.success(`${tab} exported`, { description: `${range} · ${scopeLabel}` });
  }

  return (
    <AppShell
      title="Reports"
      actions={
        <Button variant="secondary" onClick={exportCurrent}>
          <DownloadIcon className="h-4 w-4" aria-hidden="true" />
          Export CSV
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Segmented options={tabs} value={tab} onChange={setTab} />
          <div className="ml-auto flex items-center gap-2">
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              aria-label="Filter by branch"
              className={selectClass}
            >
              <option value="all">All branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.slug || b.id}>
                  {b.shortName || b.name}
                </option>
              ))}
            </select>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              aria-label="Reporting period"
              className={selectClass}
            >
              {ranges.map((r) => (
                <option key={r.label}>{r.label}</option>
              ))}
            </select>
          </div>
        </div>

        {tab === 'Sales Summary' && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Revenue"
                value={formatCurrency(stats.revenue)}
                delta={delta(stats.revenue, priorStats.revenue)}
              />
              <StatCard
                label="Transactions"
                value={formatNumber(stats.orders)}
                delta={delta(stats.orders, priorStats.orders)}
              />
              <StatCard
                label="Average basket"
                value={formatCurrency(stats.avgBasket)}
                delta={delta(stats.avgBasket, priorStats.avgBasket)}
              />
              <StatCard
                label="Items sold"
                value={formatNumber(stats.items)}
                hint={`${formatCurrency(stats.discounts)} discounted`}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="p-5 lg:col-span-2">
                <CardHeader title="Revenue by day" subtitle={`${range} · ${scopeLabel}`} className="mb-4" />
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={series} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
                      />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                      />
                      <Bar dataKey="value" fill="#3B5BFF" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-5">
                <CardHeader title="Revenue by category" className="mb-4" />
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categories}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={45}
                        outerRadius={72}
                        paddingAngle={2}
                      >
                        {categories.map((slice) => (
                          <Cell key={slice.name} fill={slice.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string) => [`${value}%`, name]}
                        contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {categories.map((slice) => (
                    <li key={slice.name} className="flex items-center gap-2 text-sm">
                      <span
                        className="h-2 w-2 rounded-sm"
                        style={{ backgroundColor: slice.color }}
                        aria-hidden="true"
                      />
                      <span className="flex-1 text-slate-600">{slice.name}</span>
                      <span className="font-mono tabular text-slate-900">
                        {formatCurrency(slice.revenue)}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="overflow-hidden">
                <CardHeader title="Top products" subtitle={`By revenue · ${range}`} />
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <Th>Product</Th>
                      <Th align="right">Units</Th>
                      <Th align="right">Revenue</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {top.map((row) => (
                      <Tr key={row.productId}>
                        <Td>
                          <p className="text-slate-900">{row.name}</p>
                          <p className="font-mono text-xs text-slate-500">{row.sku}</p>
                        </Td>
                        <Td align="right" className="font-mono tabular text-slate-600">
                          {row.units}
                        </Td>
                        <Td align="right" className="font-mono tabular font-medium text-slate-900">
                          {formatCurrency(row.revenue)}
                        </Td>
                      </Tr>
                    ))}
                  </tbody>
                </table>
              </Card>

              <AskYourData sales={scoped} rangeLabel={range} />
            </div>
          </div>
        )}

        {tab === 'Stock Valuation' && (
          <StockValuationReport valuation={valuation} scopeLabel={scopeLabel} />
        )}

        {tab === 'Profit Margin' && <ProfitMarginReport margins={margins} rangeLabel={range} />}

        {tab === 'Cashier Performance' && (
          <CashierReport cashiers={cashiers} rangeLabel={range} />
        )}
      </div>
    </AppShell>
  );
}