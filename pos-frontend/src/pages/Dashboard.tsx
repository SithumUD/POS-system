import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUpIcon,
  TrendingDownIcon,
  ReceiptTextIcon,
  ShoppingBasketIcon,
  AlertTriangleIcon,
  BanknoteIcon,
  PackageCheckIcon,
  ArrowLeftRightIcon,
  XCircleIcon
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MonitorPlayIcon } from 'lucide-react';
import { ToolbarSelect } from '../components/ui/Toolbar';
import { Th, Td, Tr } from '../components/ui/Table';
import {
  revenueSeries,
  topProducts,
  categoryBreakdown
} from '../utils/analytics';
import { stockState, totalStock } from '../data/products';
import { useStore } from '../contexts/StoreContext';
import { formatCurrency, formatNumber } from '../utils/currency';
import { relativeTime } from '../utils/time';
import { MovementType } from '../types';

function isToday(iso: string): boolean {
  if (!iso) return false;
  const date = new Date(iso);
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

export function Dashboard() {
  const { sales, products, movements, branches } = useStore();

  const today = useMemo(() => {
    const todays = sales.filter((s) => isToday(s.soldAt || s.createdAt || (s as any).at || '') && (s.status === 'COMPLETED' || s.status === ('Completed' as any)));
    const revenue = todays.reduce((sum, s) => sum + s.total, 0);
    return {
      revenue,
      count: todays.length,
      basket: todays.length > 0 ? revenue / todays.length : 0
    };
  }, [sales]);

  const lowStockCount = useMemo(() => {
    let count = 0;
    products.forEach((product) => {
      branches.forEach((branch) => {
        const bKey = branch.slug || branch.id;
        const q = product.stock?.[bKey] ?? product.stock?.[branch.id] ?? 0;
        const thresh = product.reorderThreshold ?? product.threshold ?? 0;
        if (stockState(q, thresh) === 'low-stock') count += 1;
      });
    });
    return count;
  }, [products, branches]);

  const trendData = useMemo(() => {
    const raw = revenueSeries(sales, 14);
    // Overwrite the last day with 'Today' real-time data just to be safe
    const data = raw.slice(0, 13).map((point) => ({ day: point.day, value: point.value }));
    data.push({ day: 'Today', value: Math.round(today.revenue) });
    return data;
  }, [sales, today.revenue]);

  const sparklineData = useMemo(() => {
    return revenueSeries(sales, 7).map((point) => ({
      v: Math.round(point.value / 1000)
    }));
  }, [sales]);

  const topSelling = useMemo(() => {
    return topProducts(sales, 5).map((entry) => ({
      name: entry.name,
      units: entry.units,
      revenue: entry.revenue
    }));
  }, [sales]);

  const salesByCat = useMemo(() => {
    return categoryBreakdown(sales, products).map((slice) => ({
      name: slice.name,
      value: slice.value,
      color: slice.color
    }));
  }, [sales, products]);

  const dynamicReorderSuggestions = useMemo(() => {
    const low = products.filter((p) => {
      const thresh = p.reorderThreshold ?? p.threshold ?? 0;
      const q = Object.values(p.stock || {}).reduce((s, v) => s + v, 0);
      return q <= thresh;
    });
    return low.slice(0, 4).map((p) => ({
      product: p.name,
      sku: p.sku,
      suggested: Math.max((p.reorderThreshold ?? p.threshold ?? 10) * 2, 10),
      reason: 'Below reorder threshold'
    }));
  }, [products]);

  const activity = useMemo(
    () =>
      movements.slice(0, 7).map((m) => {
        const prodId = typeof (m as any).product === 'object' ? (m as any).product?.id : (m as any).productId;
        const branchKey = typeof (m as any).branch === 'string' ? (m as any).branch : (m as any).branch?.slug || (m as any).branchSlug || '';
        const product = products.find((p) => p.id === prodId);
        const branchObj = branches.find((b) => b.slug === branchKey || b.id === branchKey);
        const qtyVal = m.quantity ?? m.qty ?? 0;
        const refVal = m.referenceId || m.reference || '';
        const timeVal = m.createdAt || m.at || '';

        let text = '';
        if (m.type === 'SALE' || m.type === ('Sale' as any)) {
          text = `${qtyVal * -1} × ${product?.name ?? 'Item'} sold · ${refVal}`;
        } else if (m.type === 'PURCHASE' || m.type === ('Purchase' as any)) {
          text = `${m.note} · +${qtyVal} ${product?.name ?? ''}`;
        } else {
          text = `${product?.name ?? 'Item'} ${qtyVal > 0 ? '+' : ''}${qtyVal} · ${m.note}`;
        }

        return {
          id: m.id,
          type: m.type,
          text,
          meta: `${branchObj?.shortName || branchObj?.name || branchKey} · ${relativeTime(timeVal)}`
        };
      }),
    [movements, products, branches]
  );

  return (
    <AppShell
      title="Dashboard"
      toolbar={
        <>
          <Button 
            variant="secondary" 
            onClick={() => window.open('/customer-display', '_blank', 'width=1024,height=768')}
            className="hidden sm:flex gap-2 items-center"
          >
            <MonitorPlayIcon className="h-4 w-4" />
            Customer Display
          </Button>
          <ToolbarSelect label="All Branches" />
          <ToolbarSelect label="Today" />
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Today&apos;s Sales
                </p>
                <p className="mt-2 font-mono text-2xl font-bold tabular tracking-tight text-slate-900">
                  {formatCurrency(today.revenue)}
                </p>
                <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <TrendingUpIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  Live from all terminals
                </p>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <BanknoteIcon className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-3 h-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}>
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke="#3B5BFF"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <KpiCard
            label="Transactions"
            value={formatNumber(today.count)}
            delta="Completed sales today"
            deltaTone="up"
            icon={ReceiptTextIcon}
          />

          <KpiCard
            label="Avg. Basket Size"
            value={formatCurrency(today.basket)}
            delta={today.basket > 400 ? 'Above 30-day average' : 'Below 30-day average'}
            deltaTone={today.basket > 400 ? 'up' : 'down'}
            icon={ShoppingBasketIcon}
          />

          <Link
            to="/inventory"
            className="group rounded-card border border-amber-200 bg-amber-50/40 p-5 shadow-card transition-colors hover:bg-amber-50"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
                  Low Stock Items
                </p>
                <p className="mt-2 font-mono text-2xl font-bold tabular tracking-tight text-amber-700">
                  {lowStockCount}
                </p>
                <p className="mt-1.5 text-xs font-medium text-amber-700 group-hover:underline">
                  Review inventory →
                </p>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <AlertTriangleIcon className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
          </Link>
        </div>

        <Card>
          <CardHeader
            title="Sales Trend — Last 14 Days"
            subtitle="All branches · gross revenue per day"
            action={
              <span className="font-mono text-sm font-semibold tabular text-slate-900">
                {formatCurrency(trendData.reduce((sum, d) => sum + d.value, 0))}
              </span>
            }
          />

          <div className="h-72 px-3 py-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B5BFF" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#3B5BFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={54}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                />

                <Tooltip
                  cursor={{ stroke: '#cbd5e1' }}
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    fontSize: 12,
                    boxShadow: '0 12px 32px -8px rgba(15,23,42,0.16)'
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3B5BFF"
                  strokeWidth={2}
                  fill="url(#salesFill)"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid gap-5 xl:grid-cols-3">
          <Card>
            <CardHeader title="Top Selling Products" subtitle="By units sold, last 14 days" />
            <ul className="space-y-3.5 px-5 py-4">
              {topSelling.length === 0 ? (
                <li className="text-sm text-slate-500 text-center py-4">No sales data</li>
              ) : (
                topSelling.map((item, index) => {
                  const max = topSelling[0].units;
                  return (
                  <li key={item.name}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-sm text-slate-700">
                        <span className="mr-2 font-mono text-xs text-slate-400">{index + 1}</span>
                        {item.name}
                      </span>
                      <span className="shrink-0 font-mono text-xs tabular text-slate-500">
                        {formatNumber(item.units)} units
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{ width: `${(item.units / max) * 100}%` }}
                      />
                    </div>
                  </li>
                );
              }))}
            </ul>
          </Card>

          <Card>
            <CardHeader title="Sales by Category" subtitle="Share of revenue, last 14 days" />
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="h-44 w-44 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={salesByCat.length > 0 ? salesByCat : [{ name: 'No sales', value: 1, color: '#e2e8f0' }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={54}
                      outerRadius={84}
                      strokeWidth={0}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {(salesByCat.length > 0 ? salesByCat : [{ name: 'No sales', value: 1, color: '#e2e8f0' }]).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 10,
                        border: '1px solid #e2e8f0',
                        fontSize: 12
                      }}
                      formatter={(value: number, name: string) => [`${value}%`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3 py-1">
                {salesByCat.length === 0 ? (
                  <p className="text-sm text-slate-500">No category sales yet</p>
                ) : (
                  salesByCat.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex min-w-0 items-center gap-2 text-slate-600">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-sm"
                          style={{ backgroundColor: cat.color }}
                          aria-hidden="true"
                        />
                        <span className="truncate">{cat.name}</span>
                      </span>
                      <span className="font-mono text-xs tabular text-slate-500">{cat.value}%</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Live Activity"
              subtitle="Streaming from all terminals"
              action={
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Live
                </span>
              }
            />

            <ul className="max-h-[302px] divide-y divide-slate-100 overflow-y-auto thin-scroll">
              {activity.map((event) => (
                <li key={event.id} className="flex items-start gap-3 px-5 py-3">
                  <ActivityIcon type={event.type} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug text-slate-700">{event.text}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{event.meta}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card>
          <CardHeader
            title="Reorder Suggestions"
            subtitle="Generated from sales velocity and reorder thresholds"
            action={
              <Button variant="secondary" size="sm">
                Reorder all
              </Button>
            }
          />

          <div className="flex-1 overflow-x-auto thin-scroll">
            <table className="w-full min-w-[500px] border-collapse text-sm">
              <thead>
                <tr>
                  <Th>Product</Th>
                  <Th>Reason</Th>
                  <Th align="right">Suggest</Th>
                </tr>
              </thead>
              <tbody>
                {dynamicReorderSuggestions.length === 0 ? (
                  <tr>
                    <Td colSpan={3} className="text-center text-slate-500 py-6">
                      Inventory levels are healthy
                    </Td>
                  </tr>
                ) : (
                  dynamicReorderSuggestions.map((req) => (
                    <Tr key={req.sku}>
                      <Td>
                        <p className="font-medium text-slate-900">{req.product}</p>
                        <p className="font-mono text-xs text-slate-500">{req.sku}</p>
                      </Td>
                      <Td className="text-slate-600">{req.reason}</Td>
                      <Td align="right">
                        <span className="inline-flex h-7 items-center justify-center rounded bg-brand-50 px-2.5 font-mono text-xs font-semibold tabular text-brand-700">
                          +{req.suggested}
                        </span>
                      </Td>
                    </Tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  delta: string;
  deltaTone: 'up' | 'down';
  icon: React.ComponentType<{ className?: string }>;
}

function KpiCard({ label, value, delta, deltaTone, icon: Icon }: KpiCardProps) {
  const DeltaIcon = deltaTone === 'up' ? TrendingUpIcon : TrendingDownIcon;
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 font-mono text-2xl font-bold tabular tracking-tight text-slate-900">
            {value}
          </p>
          <p
            className={`mt-1.5 inline-flex items-center gap-1 text-xs font-medium ${
              deltaTone === 'up' ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            <DeltaIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {delta}
          </p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </Card>
  );
}

function ActivityIcon({ type }: { type: MovementType }) {
  const map: Record<string, { Icon: React.ComponentType<{ className?: string }>; cls: string }> = {
    SALE: { Icon: BanknoteIcon, cls: 'bg-emerald-50 text-emerald-600' },
    Sale: { Icon: BanknoteIcon, cls: 'bg-emerald-50 text-emerald-600' },
    PURCHASE: { Icon: PackageCheckIcon, cls: 'bg-sky-50 text-sky-600' },
    Purchase: { Icon: PackageCheckIcon, cls: 'bg-sky-50 text-sky-600' },
    ADJUSTMENT: { Icon: AlertTriangleIcon, cls: 'bg-amber-50 text-amber-600' },
    Adjustment: { Icon: AlertTriangleIcon, cls: 'bg-amber-50 text-amber-600' },
    TRANSFER_IN: { Icon: ArrowLeftRightIcon, cls: 'bg-violet-50 text-violet-600' },
    TRANSFER_OUT: { Icon: ArrowLeftRightIcon, cls: 'bg-violet-50 text-violet-600' },
    Transfer: { Icon: ArrowLeftRightIcon, cls: 'bg-violet-50 text-violet-600' },
    VOID: { Icon: XCircleIcon, cls: 'bg-red-50 text-red-600' },
    Void: { Icon: XCircleIcon, cls: 'bg-red-50 text-red-600' }
  };
  const item = map[type] || { Icon: BanknoteIcon, cls: 'bg-slate-50 text-slate-600' };
  const { Icon, cls } = item;
  return (
    <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${cls}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
    </span>
  );
}