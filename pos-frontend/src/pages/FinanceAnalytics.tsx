import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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
import {
  DownloadIcon,
  SparklesIcon,
  LockIcon
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Segmented } from '../components/ui/Toolbar';
import { Th, Td, Tr } from '../components/ui/Table';
import { StatCard } from '../components/reports/StatCard';
import { useStore } from '../contexts/StoreContext';
import { formatCurrency } from '../utils/currency';
import { downloadCsv, stamp } from '../utils/csv';
import {
  computePnL,
  computeBranchFinancials,
  computePaymentBreakdown,
  computeDailyFinancialSeries
} from '../utils/financeAnalytics';
import { marginByProduct, withinDays } from '../utils/analytics';

const tabs = [
  { label: 'P&L Statement & Trends' },
  { label: 'Branch Profitability' },
  { label: 'Cash Flow & Settlement' },
  { label: 'Category Margins' }
];

const ranges = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 14 days', days: 14 },
  { label: 'Last 30 days', days: 30 }
];

const selectClass =
  'h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 focus:border-brand-500 focus:outline-none';

export function FinanceAnalytics() {
  const { sales, products, branches, settings, currentUserRole, setCurrentUserRole, branchLabel } = useStore();
  const [tab, setTab] = useState('P&L Statement & Trends');
  const [branch, setBranch] = useState('all');
  const [range, setRange] = useState('Last 7 days');

  // Role Gate Check: Restricted to Admin & Manager
  const isAuthorized =
    currentUserRole === 'ADMIN' ||
    currentUserRole === 'MANAGER' ||
    (currentUserRole as any) === 'Admin' ||
    (currentUserRole as any) === 'Manager';

  const days = ranges.find((r) => r.label === range)?.days ?? 7;
  const scopeLabel = branch === 'all' ? 'All branches' : branchLabel(branch);

  const scopedSales = useMemo(
    () =>
      sales.filter((sale) => {
        const bKey = !sale?.branch
          ? ''
          : typeof sale.branch === 'string'
          ? sale.branch
          : sale.branch?.slug || sale.branch?.id || '';
        const soldTime = sale?.soldAt || sale?.createdAt || (sale as any)?.at || '';
        return (branch === 'all' || bKey === branch || (sale as any)?.branchSlug === branch) && withinDays(soldTime, days);
      }),
    [sales, branch, days]
  );

  const priorSales = useMemo(
    () =>
      sales.filter((sale) => {
        const bKey = !sale?.branch
          ? ''
          : typeof sale.branch === 'string'
          ? sale.branch
          : sale.branch?.slug || sale.branch?.id || '';
        const soldTime = sale?.soldAt || sale?.createdAt || (sale as any)?.at || '';
        return (
          (branch === 'all' || bKey === branch || (sale as any)?.branchSlug === branch) &&
          withinDays(soldTime, days * 2) &&
          !withinDays(soldTime, days)
        );
      }),
    [sales, branch, days]
  );

  const pnl = useMemo(() => computePnL(scopedSales, products, settings), [scopedSales, products, settings]);
  const priorPnl = useMemo(() => computePnL(priorSales, products, settings), [priorSales, products, settings]);
  const branchFinancials = useMemo(() => computeBranchFinancials(scopedSales, products, branches), [scopedSales, products, branches]);
  const paymentBreakdown = useMemo(() => computePaymentBreakdown(scopedSales), [scopedSales]);
  const dailySeries = useMemo(() => computeDailyFinancialSeries(scopedSales, products, days), [scopedSales, products, days]);
  const productMargins = useMemo(() => marginByProduct(scopedSales, products, 10), [scopedSales, products]);

  const delta = (now: number, before: number) =>
    before === 0 ? (now > 0 ? 100 : 0) : ((now - before) / before) * 100;

  function exportFinancialReport() {
    const scope = branch === 'all' ? 'all-branches' : branch;
    downloadCsv(`financial-statement-${scope}-${stamp()}`, [
      ['Metric', 'Amount (LKR)'],
      ['Gross Sales', pnl.grossSales],
      ['Discounts Allowed', pnl.discounts],
      ['Net Sales', pnl.netSales],
      ['Cost of Goods Sold (COGS)', pnl.cogs],
      ['Gross Profit', pnl.grossProfit],
      ['Gross Margin %', `${pnl.grossMarginPct}%`],
      ['Operating Expenses (Est.)', pnl.operatingExpenses],
      ['Operating Income', pnl.operatingIncome],
      ['Estimated Tax Liability', pnl.taxAmount],
      ['Net Profit', pnl.netIncome],
      ['Net Margin %', `${pnl.netMarginPct}%`]
    ]);
    toast.success('Financial P&L Statement Exported', { description: `${range} · ${scopeLabel}` });
  }

  // Access Restricted View for Cashiers
  if (!isAuthorized) {
    return (
      <AppShell title="Finance & Analytics">
        <div className="mx-auto max-w-2xl py-12">
          <Card className="p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-200">
              <LockIcon className="h-8 w-8" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
              Manager &amp; Admin Access Restricted
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Financial analytics, P&amp;L margin metrics, and cash settlement reports are sensitive resources restricted strictly to Manager and Admin security roles.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 border-t border-slate-100 pt-6">
              <span className="text-xs text-slate-500">Current Role: <span className="font-mono font-semibold text-slate-900">{currentUserRole}</span></span>
              <Button
                variant="primary"
                onClick={() => {
                  setCurrentUserRole('ADMIN');
                  toast.success('Switched role to ADMIN', { description: 'Access granted to Financial Analytics.' });
                }}
              >
                Switch Role to Admin
              </Button>
            </div>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Finance & Analytics"
      actions={
        <Button variant="secondary" onClick={exportFinancialReport}>
          <DownloadIcon className="h-4 w-4" aria-hidden="true" />
          Export Financial P&amp;L
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Controls & Range Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <Segmented options={tabs} value={tab} onChange={setTab} />
          <div className="ml-auto flex items-center gap-2">
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              aria-label="Filter financial scope by branch"
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
              aria-label="Financial period"
              className={selectClass}
            >
              {ranges.map((r) => (
                <option key={r.label}>{r.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Financial StatCards Grid */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Net Sales"
            value={formatCurrency(pnl.netSales)}
            delta={delta(pnl.netSales, priorPnl.netSales)}
          />
          <StatCard
            label="Cost of Goods Sold (COGS)"
            value={formatCurrency(pnl.cogs)}
            hint={`${pnl.netSales ? ((pnl.cogs / pnl.netSales) * 100).toFixed(1) : 0}% of sales`}
          />
          <StatCard
            label="Gross Profit"
            value={formatCurrency(pnl.grossProfit)}
            delta={delta(pnl.grossProfit, priorPnl.grossProfit)}
            hint={`${pnl.grossMarginPct}% gross margin`}
          />
          <StatCard
            label="Estimated Net Profit"
            value={formatCurrency(pnl.netIncome)}
            delta={delta(pnl.netIncome, priorPnl.netIncome)}
            hint={`${pnl.netMarginPct}% net margin`}
          />
        </div>

        {/* Executive AI Insights Alert */}
        <Card className="p-4 bg-gradient-to-r from-brand-50/80 via-white to-slate-50 border-brand-100">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white shadow-sm">
              <SparklesIcon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900">Executive Financial Insights</h3>
                <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                  Live Audit
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Gross margin is healthy at <strong className="text-slate-900">{pnl.grossMarginPct}%</strong>.
                {pnl.cogs > pnl.grossProfit
                  ? ' Note: Inventory COGS exceeds net profit margin — review supplier pricing.'
                  : ' Inventory turnover and pricing structures align with standard retail benchmarks.'}
                {' '}Top performing branch: <strong className="text-slate-900">{branchFinancials.sort((a, b) => b.grossProfit - a.grossProfit)[0]?.branchName ?? 'Colombo'}</strong> generating {formatCurrency(branchFinancials[0]?.grossProfit ?? 0)} gross profit.
              </p>
            </div>
          </div>
        </Card>

        {/* Tab 1: P&L Statement & Trends */}
        {tab === 'P&L Statement & Trends' && (
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="p-5 lg:col-span-2">
                <CardHeader
                  title="Financial Growth & Profit Trend"
                  subtitle={`Revenue vs COGS vs Net Profit · ${range}`}
                  className="mb-4"
                />
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailySeries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B5BFF" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3B5BFF" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `${Math.round(val / 1000)}k`} />
                      <Tooltip formatter={(val: number) => formatCurrency(val)} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
                      <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3B5BFF" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                      <Area type="monotone" dataKey="profit" name="Gross Profit" stroke="#10B981" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Profit & Loss Statement Summary */}
              <Card className="p-5 overflow-hidden">
                <CardHeader title="Income Statement (P&amp;L)" subtitle={range} className="mb-3" />
                <dl className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <dt className="text-slate-500">Gross Sales</dt>
                    <dd className="font-mono tabular font-medium text-slate-900">{formatCurrency(pnl.grossSales)}</dd>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <dt className="text-slate-500">Less Discounts Allowed</dt>
                    <dd className="font-mono tabular text-emerald-600">−{formatCurrency(pnl.discounts)}</dd>
                  </div>
                  <div className="flex justify-between py-1.5 font-semibold bg-slate-50 px-2 rounded">
                    <dt className="text-slate-900">Net Revenue</dt>
                    <dd className="font-mono tabular text-slate-900">{formatCurrency(pnl.netSales)}</dd>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <dt className="text-slate-500">Cost of Goods Sold (COGS)</dt>
                    <dd className="font-mono tabular text-red-600">−{formatCurrency(pnl.cogs)}</dd>
                  </div>
                  <div className="flex justify-between py-1.5 font-semibold bg-emerald-50 px-2 rounded text-emerald-950">
                    <dt>Gross Profit ({pnl.grossMarginPct}%)</dt>
                    <dd className="font-mono tabular">{formatCurrency(pnl.grossProfit)}</dd>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <dt className="text-slate-500">Est. Operating Overhead (18%)</dt>
                    <dd className="font-mono tabular text-slate-600">−{formatCurrency(pnl.operatingExpenses)}</dd>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <dt className="text-slate-500">Est. Tax Liability</dt>
                    <dd className="font-mono tabular text-slate-600">−{formatCurrency(pnl.taxAmount)}</dd>
                  </div>
                  <div className="flex justify-between py-2 font-bold bg-brand-500 text-white px-2.5 rounded-lg text-sm">
                    <span>Net Earnings</span>
                    <span className="font-mono tabular">{formatCurrency(pnl.netIncome)}</span>
                  </div>
                </dl>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 2: Branch Profitability */}
        {tab === 'Branch Profitability' && (
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <CardHeader title="Branch Profitability &amp; Asset Breakdown" subtitle={`${range} · All Active Outlets`} />
              <div className="overflow-x-auto thin-scroll">
                <table className="w-full min-w-[720px] border-collapse text-sm">
                  <thead>
                    <tr>
                      <Th>Branch</Th>
                      <Th align="right">Orders</Th>
                      <Th align="right">Revenue</Th>
                      <Th align="right">COGS</Th>
                      <Th align="right">Gross Profit</Th>
                      <Th align="right">Margin %</Th>
                      <Th align="right">Stock Asset Value</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {branchFinancials.map((row) => (
                      <Tr key={row.branchId}>
                        <Td className="font-medium text-slate-900">{row.branchName}</Td>
                        <Td align="right" className="font-mono tabular text-slate-600">{row.orderCount}</Td>
                        <Td align="right" className="font-mono tabular text-slate-900">{formatCurrency(row.revenue)}</Td>
                        <Td align="right" className="font-mono tabular text-red-600">−{formatCurrency(row.cogs)}</Td>
                        <Td align="right" className="font-mono tabular font-semibold text-emerald-600">{formatCurrency(row.grossProfit)}</Td>
                        <Td align="right" className="font-mono tabular text-slate-900">{row.marginPct}%</Td>
                        <Td align="right" className="font-mono tabular text-slate-700">{formatCurrency(row.stockValue)}</Td>
                      </Tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="p-5">
                <CardHeader title="Branch Revenue Comparison" className="mb-4" />
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={branchFinancials} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="branchName" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `${Math.round(val / 1000)}k`} />
                      <Tooltip formatter={(val: number) => formatCurrency(val)} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
                      <Bar dataKey="revenue" name="Revenue" fill="#3B5BFF" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="grossProfit" name="Gross Profit" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-5">
                <CardHeader title="Branch Profit Margins" className="mb-4" />
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={branchFinancials} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                      <XAxis type="number" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="branchName" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(val: number) => `${val}%`} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
                      <Bar dataKey="marginPct" name="Margin %" fill="#0EA5E9" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 3: Cash Flow & Settlement */}
        {tab === 'Cash Flow & Settlement' && (
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="p-5 lg:col-span-2 overflow-hidden">
                <CardHeader title="Payment Channel Distribution" subtitle="Cash drawer vs digital settlement channels" />
                <table className="w-full border-collapse text-sm mt-3">
                  <thead>
                    <tr>
                      <Th>Payment Method</Th>
                      <Th align="right">Transactions</Th>
                      <Th align="right">Total Settled</Th>
                      <Th align="right">Share %</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentBreakdown.map((row) => (
                      <Tr key={row.method}>
                        <Td className="font-medium text-slate-900">{row.method}</Td>
                        <Td align="right" className="font-mono tabular text-slate-600">{row.transactionCount}</Td>
                        <Td align="right" className="font-mono tabular font-semibold text-slate-900">{formatCurrency(row.totalAmount)}</Td>
                        <Td align="right" className="font-mono tabular text-brand-600 font-medium">{row.percentage}%</Td>
                      </Tr>
                    ))}
                  </tbody>
                </table>
              </Card>

              <Card className="p-5">
                <CardHeader title="Payment Mix" className="mb-3" />
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={paymentBreakdown} dataKey="totalAmount" nameKey="method" innerRadius={40} outerRadius={68} paddingAngle={3}>
                        <Cell fill="#10B981" />
                        <Cell fill="#3B5BFF" />
                        <Cell fill="#F59E0B" />
                      </Pie>
                      <Tooltip formatter={(val: number) => formatCurrency(val)} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="mt-2 space-y-1 text-xs">
                  {paymentBreakdown.map((item) => (
                    <li key={item.method} className="flex justify-between text-slate-600">
                      <span>{item.method}</span>
                      <span className="font-mono font-semibold text-slate-900">{item.percentage}%</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 4: Category Margins */}
        {tab === 'Category Margins' && (
          <Card className="overflow-hidden">
            <CardHeader title="Top SKU Profitability &amp; Margins" subtitle={`Top 10 SKUs by total profit contribution · ${range}`} />
            <div className="overflow-x-auto thin-scroll">
              <table className="w-full min-w-[700px] border-collapse text-sm">
                <thead>
                  <tr>
                    <Th>Product</Th>
                    <Th>SKU</Th>
                    <Th align="right">Units Sold</Th>
                    <Th align="right">Revenue</Th>
                    <Th align="right">Est. COGS</Th>
                    <Th align="right">Net Profit</Th>
                    <Th align="right">Margin %</Th>
                  </tr>
                </thead>
                <tbody>
                  {productMargins.map((row) => (
                    <Tr key={row.sku}>
                      <Td className="font-medium text-slate-900">{row.name}</Td>
                      <Td className="font-mono text-xs text-slate-500">{row.sku}</Td>
                      <Td align="right" className="font-mono tabular text-slate-600">{row.units}</Td>
                      <Td align="right" className="font-mono tabular text-slate-900">{formatCurrency(row.revenue)}</Td>
                      <Td align="right" className="font-mono tabular text-red-600">−{formatCurrency(row.cost)}</Td>
                      <Td align="right" className="font-mono tabular font-semibold text-emerald-600">{formatCurrency(row.profit)}</Td>
                      <Td align="right" className="font-mono tabular font-medium text-slate-900">{row.margin.toFixed(1)}%</Td>
                    </Tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
