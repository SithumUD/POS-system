import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  DownloadIcon,
  BanknoteIcon,
  CreditCardIcon,
  SplitIcon,
  PrinterIcon,
  XIcon,
  SearchIcon,
  RotateCcwIcon,
  BanIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Th, Td, Tr } from '../components/ui/Table';
import { SlideOver } from '../components/ui/Modal';
import { SaleActionModal } from '../components/sales/SaleActionModal';
import { useStore } from '../contexts/StoreContext';
import { formatCurrency } from '../utils/currency';
import { formatDateTime } from '../utils/time';
import { withinDays, summaryStats } from '../utils/analytics';
import { downloadCsv, stamp } from '../utils/csv';
import { PaymentMethod, Sale, SaleStatus } from '../types';

const paymentIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  CASH: BanknoteIcon,
  Cash: BanknoteIcon,
  CARD: CreditCardIcon,
  Card: CreditCardIcon,
  SPLIT: SplitIcon,
  Split: SplitIcon
};

const statusTones: Record<string, 'green' | 'red' | 'amber'> = {
  COMPLETED: 'green',
  Completed: 'green',
  VOIDED: 'red',
  Voided: 'red',
  REFUNDED: 'amber',
  Refunded: 'amber'
};

const selectClass =
  'h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 focus:border-brand-500 focus:outline-none';

const ranges = [
  { label: 'Today', days: 1 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 14 days', days: 14 },
  { label: 'Last 30 days', days: 30 },
  { label: 'All time', days: 0 }
];

const PAGE_SIZE = 25;

function getCashierName(c: any, sale?: any): string {
  if (sale && sale.cashierName) return sale.cashierName;
  if (!c) return '';
  if (typeof c === 'string') return c;
  return c.fullName || c.username || c.name || '';
}

function getBranchKey(b: any, sale?: any): string {
  if (sale && sale.branchSlug) return sale.branchSlug;
  if (!b) return '';
  if (typeof b === 'string') return b;
  return b.slug || b.id || '';
}

export function SalesHistory() {
  const { sales, branches, branchLabel, settings } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [branch, setBranch] = useState('All');
  const [cashier, setCashier] = useState('All');
  const [payment, setPayment] = useState('All');
  const [status, setStatus] = useState('All');
  const [range, setRange] = useState('Last 7 days');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [action, setAction] = useState<{ sale: Sale; mode: 'refund' | 'void' } | null>(null);

  const cashiers = useMemo(
    () => Array.from(new Set(sales.map((s) => getCashierName(s.cashier)))).filter(Boolean).sort(),
    [sales]
  );

  const visible = useMemo(() => {
    const days = ranges.find((r) => r.label === range)?.days ?? 0;
    const term = query.trim().toLowerCase();
    return sales.filter((sale) => {
      const soldTime = sale.soldAt || sale.createdAt || (sale as any).at || '';
      if (days > 0 && !withinDays(soldTime, days)) return false;
      const bKey = getBranchKey(sale.branch, sale);
      if (branch !== 'All' && bKey !== branch && sale.branch !== branch && (sale as any).branchSlug !== branch) return false;
      const cName = getCashierName(sale.cashier, sale);
      if (cashier !== 'All' && cName !== cashier) return false;
      const payMethod = sale.payments?.[0]?.method || sale.payment;
      if (payment !== 'All' && payMethod !== payment && payMethod?.toLowerCase() !== payment.toLowerCase()) return false;
      if (status !== 'All' && sale.status !== status) return false;
      const saleId = sale.receiptNumber || sale.id;
      const items = sale.items || sale.lines || [];
      if (
        term &&
        !saleId.toLowerCase().includes(term) &&
        !items.some((l) => (l.productNameSnapshot || l.name || l.product?.name || '').toLowerCase().includes(term))
      ) {
        return false;
      }
      return true;
    });
  }, [sales, branch, cashier, payment, status, range, query]);

  const stats = useMemo(() => summaryStats(visible), [visible]);
  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const rows = visible.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);
  const selected = sales.find((s) => s.id === selectedId || s.receiptNumber === selectedId) ?? null;

  function resetPage<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(0);
    };
  }

  function exportCsv() {
    downloadCsv(
      `sales-history-${stamp()}`,
      [
        ['Sale ID', 'Date', 'Branch', 'Cashier', 'Payment', 'Status', 'Items', 'Subtotal', 'Discount', settings.taxLabel, 'Total'],
        ...visible.map((sale) => {
          const items = sale.items || sale.lines || [];
          const payMethod = sale.payments?.[0]?.method || sale.payment;
          const bKey = getBranchKey(sale.branch, sale);
          return [
            sale.receiptNumber || sale.id,
            formatDateTime(sale.soldAt || sale.createdAt || (sale as any).at || ''),
            branchLabel(bKey),
            getCashierName(sale.cashier, sale),
            payMethod,
            sale.status,
            items.reduce((sum, l) => sum + l.quantity, 0),
            sale.subtotal,
            sale.discount,
            sale.tax,
            sale.total
          ];
        })
      ]
    );
    toast.success(`Exported ${visible.length} sales`, { description: 'CSV saved to downloads.' });
  }

  return (
    <AppShell
      title="Sales History"
      actions={
        <Button variant="secondary" onClick={exportCsv}>
          <DownloadIcon className="h-4 w-4" aria-hidden="true" />
          Export CSV
        </Button>
      }
    >
      <div className="space-y-4">
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Net revenue', value: formatCurrency(stats.revenue) },
            { label: 'Transactions', value: stats.orders.toLocaleString() },
            { label: 'Average basket', value: formatCurrency(stats.avgBasket) },
            {
              label: 'Voids & refunds',
              value: `${stats.voids + stats.refunds}`,
              hint: formatCurrency(stats.refundValue)
            }
          ].map((stat) => (
            <li key={stat.label}>
              <Card className="p-4">
                <p className="text-xs text-slate-500">{stat.label}</p>
                <p className="mt-1 font-mono text-xl font-semibold tabular text-slate-900">
                  {stat.value}
                </p>
                {stat.hint && <p className="text-xs text-slate-400">{stat.hint} refunded</p>}
              </Card>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px]">
            <SearchIcon
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => resetPage(setQuery)(e.target.value)}
              placeholder="Search sale ID or product"
              aria-label="Search sales"
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <select
            value={range}
            onChange={(e) => resetPage(setRange)(e.target.value)}
            aria-label="Filter by date range"
            className={selectClass}
          >
            {ranges.map((r) => (
              <option key={r.label}>{r.label}</option>
            ))}
          </select>
          <select
            value={branch}
            onChange={(e) => resetPage(setBranch)(e.target.value)}
            aria-label="Filter by branch"
            className={selectClass}
          >
            <option value="All">All branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.slug || b.id}>
                {b.shortName || b.name}
              </option>
            ))}
          </select>
          <select
            value={cashier}
            onChange={(e) => resetPage(setCashier)(e.target.value)}
            aria-label="Filter by cashier"
            className={selectClass}
          >
            <option value="All">All cashiers</option>
            {cashiers.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
          <select
            value={payment}
            onChange={(e) => resetPage(setPayment)(e.target.value)}
            aria-label="Filter by payment method"
            className={selectClass}
          >
            <option value="All">Payment: All</option>
            <option value="CASH">CASH</option>
            <option value="CARD">CARD</option>
            <option value="SPLIT">SPLIT</option>
          </select>
          <select
            value={status}
            onChange={(e) => resetPage(setStatus)(e.target.value)}
            aria-label="Filter by status"
            className={selectClass}
          >
            <option value="All">Status: All</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="VOIDED">VOIDED</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>
          <span className="ml-auto font-mono text-xs tabular text-slate-500">
            {visible.length} sales · {formatCurrency(stats.revenue)}
          </span>
        </div>

        <Card className="overflow-hidden">
          <div className="max-h-[640px] overflow-auto thin-scroll">
            <table className="w-full min-w-[980px] border-collapse text-sm">
              <thead>
                <tr>
                  <Th>Sale ID</Th>
                  <Th>Date / Time</Th>
                  <Th>Branch</Th>
                  <Th>Cashier</Th>
                  <Th align="right">Items</Th>
                  <Th>Payment</Th>
                  <Th align="right">Total</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((sale) => {
                  const payMethod = sale.payments?.[0]?.method || sale.payment || 'CASH';
                  const Icon = paymentIcons[payMethod] || BanknoteIcon;
                  const items = sale.items || sale.lines || [];
                  const itemCount = items.reduce((sum, l) => sum + l.quantity, 0);
                  const bKey = getBranchKey(sale.branch, sale);
                  const cName = getCashierName(sale.cashier, sale);
                  const saleIdDisp = sale.receiptNumber || sale.id;

                  return (
                    <Tr
                      key={sale.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedId(sale.id)}
                    >
                      <Td className="font-mono text-sm font-medium text-brand-600">{saleIdDisp}</Td>
                      <Td className="whitespace-nowrap text-slate-600">
                        {formatDateTime(sale.soldAt || sale.createdAt || (sale as any).at || '')}
                      </Td>
                      <Td className="whitespace-nowrap text-slate-600">{branchLabel(bKey)}</Td>
                      <Td className="whitespace-nowrap text-slate-700">{cName}</Td>
                      <Td align="right" className="font-mono tabular text-slate-600">
                        {itemCount}
                      </Td>
                      <Td>
                        <span className="inline-flex items-center gap-1.5 text-slate-600">
                          <Icon className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                          {payMethod}
                        </span>
                      </Td>
                      <Td align="right" className="font-mono tabular font-semibold text-slate-900">
                        {formatCurrency(sale.total)}
                      </Td>
                      <Td>
                        <Badge tone={statusTones[sale.status] || 'slate'} dot>
                          {sale.status}
                        </Badge>
                      </Td>
                    </Tr>
                  );
                })}
              </tbody>
            </table>
            {visible.length === 0 && (
              <p className="py-16 text-center text-sm text-slate-500">
                No sales match these filters.
              </p>
            )}
          </div>

          {visible.length > PAGE_SIZE && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
              <p className="text-xs text-slate-500">
                Showing {current * PAGE_SIZE + 1}–
                {Math.min((current + 1) * PAGE_SIZE, visible.length)} of {visible.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={current === 0}
                  onClick={() => setPage(current - 1)}
                >
                  <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
                  Previous
                </Button>
                <span className="font-mono text-xs tabular text-slate-500">
                  {current + 1} / {pageCount}
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={current >= pageCount - 1}
                  onClick={() => setPage(current + 1)}
                >
                  Next
                  <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <ReceiptPanel
        sale={selected}
        onClose={() => setSelectedId(null)}
        branchLabel={branchLabel}
        taxLabel={`${settings.taxLabel} (${settings.taxRate}%)`}
        onRefund={(sale) => setAction({ sale, mode: 'refund' })}
        onVoid={(sale) => setAction({ sale, mode: 'void' })}
      />

      <SaleActionModal
        open={Boolean(action)}
        onClose={() => setAction(null)}
        sale={action?.sale ?? null}
        mode={action?.mode ?? 'refund'}
      />
    </AppShell>
  );
}

interface ReceiptPanelProps {
  sale: Sale | null;
  onClose: () => void;
  branchLabel: (branch: string) => string;
  taxLabel: string;
  onRefund: (sale: Sale) => void;
  onVoid: (sale: Sale) => void;
}

function ReceiptPanel({
  sale,
  onClose,
  branchLabel,
  taxLabel,
  onRefund,
  onVoid
}: ReceiptPanelProps) {
  const bKey = getBranchKey(sale?.branch, sale);
  const cName = getCashierName(sale?.cashier, sale);
  const saleIdDisp = sale?.receiptNumber || sale?.id || '';
  const soldTime = sale?.soldAt || sale?.createdAt || sale?.at || '';
  const payMethod = sale?.payments?.[0]?.method || sale?.payment || 'CASH';
  const tendered = sale?.payments?.[0]?.tenderedAmount ?? sale?.tendered;
  const items = sale?.items || sale?.lines || [];

  return (
    <SlideOver open={Boolean(sale)} onClose={onClose} label="Sale receipt" width="max-w-md">
      {sale && (
        <>
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
            <div>
              <h2 className="font-mono text-lg font-bold tracking-tight text-slate-900">
                {saleIdDisp}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">{formatDateTime(soldTime)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={statusTones[sale.status] || 'slate'} dot>
                {sale.status}
              </Badge>
              <button
                onClick={onClose}
                aria-label="Close receipt"
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 thin-scroll">
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-slate-500">Branch</dt>
              <dd className="text-right text-slate-800">{branchLabel(bKey)}</dd>
              <dt className="text-slate-500">Cashier</dt>
              <dd className="text-right text-slate-800">{cName}</dd>
              <dt className="text-slate-500">Payment</dt>
              <dd className="text-right text-slate-800">{payMethod}</dd>
              {tendered ? (
                <>
                  <dt className="text-slate-500">Tendered</dt>
                  <dd className="text-right font-mono tabular text-slate-800">
                    {formatCurrency(tendered)}
                  </dd>
                </>
              ) : null}
            </dl>

            {sale.note && (
              <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-inset ring-amber-200">
                {sale.status}: {sale.note}
              </p>
            )}

            <div className="my-5 border-t border-dashed border-slate-200" />

            <ul className="space-y-3">
              {(items as any[]).map((line, idx) => {
                const name = line.productNameSnapshot || line.name || line.product?.name || '';
                const price = line.unitPriceAtSale ?? line.unitPrice ?? 0;
                const lineTot = line.lineTotal ?? line.quantity * price;
                return (
                  <li key={line.id || idx} className="flex items-start justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate text-slate-800">{name}</p>
                      <p className="font-mono text-xs tabular text-slate-400">
                        {line.quantity} × {formatCurrency(price)}
                      </p>
                    </div>
                    <span className="font-mono tabular text-slate-900">
                      {formatCurrency(lineTot)}
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="my-5 border-t border-dashed border-slate-200" />

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Subtotal</dt>
                <dd className="font-mono tabular text-slate-700">
                  {formatCurrency(sale.subtotal)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Discount</dt>
                <dd className="font-mono tabular text-emerald-600">
                  −{formatCurrency(sale.discount)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">{taxLabel}</dt>
                <dd className="font-mono tabular text-slate-700">{formatCurrency(sale.tax)}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-slate-200 pt-2.5">
                <dt className="text-base font-semibold text-slate-900">Total</dt>
                <dd className="font-mono text-xl font-bold tabular text-slate-900">
                  {formatCurrency(sale.total)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-slate-200 bg-slate-50/60 px-6 py-3">
            {(sale.status === 'COMPLETED' || sale.status === ('Completed' as any)) && (
              <>
                <Button size="sm" variant="ghost" onClick={() => onVoid(sale)}>
                  <BanIcon className="h-4 w-4" aria-hidden="true" />
                  Void
                </Button>
                <Button size="sm" variant="secondary" onClick={() => onRefund(sale)}>
                  <RotateCcwIcon className="h-4 w-4" aria-hidden="true" />
                  Refund
                </Button>
              </>
            )}
            <div className="ml-auto flex items-center gap-2">
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
              <Button variant="primary" onClick={() => toast.success('Receipt sent to printer')}>
                <PrinterIcon className="h-4 w-4" aria-hidden="true" />
                Print
              </Button>
            </div>
          </div>
        </>
      )}
    </SlideOver>
  );
}