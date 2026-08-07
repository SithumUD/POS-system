import React, { useMemo, useState } from 'react';
import { PlusIcon, SearchIcon } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Segmented } from '../components/ui/Toolbar';
import { Th, Td, Tr } from '../components/ui/Table';
import { StockAdjustmentModal } from '../components/inventory/StockAdjustmentModal';
import { useStore } from '../contexts/StoreContext';
import { stockState } from '../data/products';
import { relativeTime } from '../utils/time';
import { BranchId } from '../types';

interface Row {
  productId: string;
  name: string;
  sku: string;
  branch: BranchId;
  branchLabel: string;
  qty: number;
  threshold: number;
  updatedAt: string;
  state: ReturnType<typeof stockState>;
}

export function Inventory() {
  const { products, branch, setBranch, branches } = useStore();
  const [scope, setScope] = useState<BranchId | 'all'>('colombo');
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [adjustFor, setAdjustFor] = useState<{ productId?: string; branchId?: BranchId } | null>(
    null
  );

  const rows = useMemo<Row[]>(() => {
    const scoped = scope === 'all' ? branches.map((b) => b.slug || b.id) : [scope];
    const list: Row[] = [];
    products.forEach((product) => {
      scoped.forEach((bKey) => {
        const qty = product.stock?.[bKey] ?? product.stock?.[bKey.toLowerCase()] ?? 0;
        const thresh = product.reorderThreshold ?? product.threshold ?? 0;
        const bObj = branches.find((b) => b.slug === bKey || b.id === bKey);
        list.push({
          productId: product.id,
          name: product.name,
          sku: product.sku,
          branch: bKey,
          branchLabel: bObj?.shortName || bObj?.name || bKey,
          qty,
          threshold: thresh,
          updatedAt: product.updatedAt,
          state: stockState(qty, thresh)
        });
      });
    });
    return list;
  }, [products, scope, branches]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rows
      .filter((row) => {
        const matchesTerm =
          term.length === 0 ||
          row.name.toLowerCase().includes(term) ||
          row.sku.toLowerCase().includes(term);
        const matchesFilter =
          filter === 'All' ||
          (filter === 'Low Stock' && row.state === 'low-stock') ||
          (filter === 'Out of Stock' && row.state === 'out-of-stock') ||
          (filter === 'In Stock' && row.state === 'in-stock');
        return matchesTerm && matchesFilter;
      })
      .sort((a, b) => a.qty - b.qty);
  }, [rows, query, filter]);

  const stats = useMemo(() => {
    const skus = new Set(rows.map((r) => r.productId)).size;
    return {
      skus,
      low: rows.filter((r) => r.state === 'low-stock').length,
      out: rows.filter((r) => r.state === 'out-of-stock').length
    };
  }, [rows]);

  return (
    <AppShell
      title="Inventory"
      toolbar={
        <select
          value={scope}
          onChange={(e) => {
            const value = e.target.value as BranchId | 'all';
            setScope(value);
            if (value !== 'all') setBranch(value);
          }}
          aria-label="Select branch"
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 focus:border-brand-500 focus:outline-none"
        >
          {branches.map((b) => (
            <option key={b.id} value={b.slug || b.id}>
              {b.name}
            </option>
          ))}
          <option value="all">All branches</option>
        </select>
      }
      actions={
        <Button variant="primary" onClick={() => setAdjustFor({})}>
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          Stock Adjustment
        </Button>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total SKUs"
            value={stats.skus}
            tone="slate"
            active={filter === 'All'}
            onClick={() => setFilter('All')}
          />
          <StatCard
            label="Low Stock"
            value={stats.low}
            tone="amber"
            active={filter === 'Low Stock'}
            onClick={() => setFilter('Low Stock')}
          />
          <StatCard
            label="Out of Stock"
            value={stats.out}
            tone="red"
            active={filter === 'Out of Stock'}
            onClick={() => setFilter('Out of Stock')}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[240px] flex-1">
            <SearchIcon
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search inventory by product or SKU"
              aria-label="Search inventory"
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <Segmented
            options={[
              { label: 'All', count: rows.length },
              { label: 'In Stock' },
              { label: 'Low Stock', count: stats.low },
              { label: 'Out of Stock', count: stats.out }
            ]}
            value={filter}
            onChange={setFilter}
          />
        </div>

        <Card className="overflow-hidden">
          <div className="max-h-[620px] overflow-auto thin-scroll">
            <table className="w-full min-w-[900px] border-collapse text-sm">
              <thead>
                <tr>
                  <Th>Product</Th>
                  <Th>Branch</Th>
                  <Th align="right">Qty on Hand</Th>
                  <Th align="right">Reorder Threshold</Th>
                  <Th>Status</Th>
                  <Th>Last Updated</Th>
                  <Th align="right" />
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <Tr key={`${row.productId}-${row.branch}`}>
                    <Td>
                      <p className="font-medium text-slate-900">{row.name}</p>
                      <p className="font-mono text-xs text-slate-400">{row.sku}</p>
                    </Td>
                    <Td className="whitespace-nowrap text-slate-600">{row.branchLabel}</Td>
                    <Td align="right">
                      <span
                        className={`font-mono text-lg font-semibold tabular ${
                          row.state === 'out-of-stock'
                            ? 'text-red-600'
                            : row.state === 'low-stock'
                            ? 'text-amber-600'
                            : 'text-slate-900'
                        }`}
                      >
                        {row.qty}
                      </span>
                    </Td>
                    <Td align="right" className="font-mono tabular text-slate-500">
                      {row.threshold}
                    </Td>
                    <Td>
                      {row.state === 'out-of-stock' ? (
                        <Badge tone="red" dot>
                          Out of Stock
                        </Badge>
                      ) : row.state === 'low-stock' ? (
                        <Badge tone="amber" dot>
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge tone="green" dot>
                          In Stock
                        </Badge>
                      )}
                    </Td>
                    <Td className="whitespace-nowrap text-slate-500">
                      {relativeTime(row.updatedAt)}
                    </Td>
                    <Td align="right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          setAdjustFor({ productId: row.productId, branchId: row.branch })
                        }
                      >
                        Adjust Stock
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </table>
            {visible.length === 0 && (
              <p className="py-16 text-center text-sm text-slate-500">
                No inventory rows match these filters.
              </p>
            )}
          </div>
        </Card>
      </div>

      <StockAdjustmentModal
        open={adjustFor !== null}
        onClose={() => setAdjustFor(null)}
        productId={adjustFor?.productId}
        branchId={adjustFor?.branchId ?? (scope === 'all' ? branch : scope)}
      />
    </AppShell>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  tone: 'slate' | 'amber' | 'red';
  active: boolean;
  onClick: () => void;
}

function StatCard({ label, value, tone, active, onClick }: StatCardProps) {
  const map = {
    slate: 'border-slate-200 bg-white text-slate-900',
    amber: 'border-amber-200 bg-amber-50/50 text-amber-700',
    red: 'border-red-200 bg-red-50/50 text-red-700'
  };
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-card border p-4 text-left shadow-card transition-all hover:-translate-y-0.5 ${map[tone]} ${
        active ? 'ring-2 ring-brand-500/30' : ''
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-1.5 font-mono text-2xl font-bold tabular tracking-tight">{value}</p>
    </button>
  );
}