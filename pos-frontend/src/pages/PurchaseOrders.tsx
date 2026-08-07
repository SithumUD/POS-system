import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  PlusIcon,
  SearchIcon,
  DownloadIcon,
  ClipboardListIcon,
  AlertCircleIcon,
  PackageCheckIcon,
  WalletIcon
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Segmented } from '../components/ui/Toolbar';
import { Th, Td, Tr } from '../components/ui/Table';
import { Select } from '../components/ui/Field';
import { PurchaseOrderFormModal } from '../components/purchasing/PurchaseOrderFormModal';
import { useStore } from '../contexts/StoreContext';
import { poStatusTones, poProgress, poTotal, poUnits } from '../data/purchasing';
import { formatCurrency } from '../utils/currency';
import { formatDate, daysUntil } from '../utils/time';
import { downloadCsv, stamp } from '../utils/csv';
import { PoStatus } from '../types';

export { poStatusTones };

const STATUSES: PoStatus[] = [
  'DRAFT',
  'SENT',
  'PARTIALLY_RECEIVED',
  'RECEIVED',
  'CLOSED',
  'CANCELLED'
];

function ExpectedCell({ iso, status }: { iso: string | null; status: PoStatus }) {
  if (!iso) return <span className="text-slate-400">—</span>;
  const days = daysUntil(iso);
  const open = status === 'SENT' || status === 'PARTIALLY_RECEIVED';
  if (open && days < 0) {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-red-600">
        {formatDate(iso)}
        <span className="text-xs font-medium">({Math.abs(days)}d late)</span>
      </span>
    );
  }
  return (
    <span className="whitespace-nowrap text-slate-500">
      {formatDate(iso)}
      {open && days <= 2 && (
        <span className="ml-1.5 text-xs font-medium text-amber-600">
          {days === 0 ? '(today)' : `(in ${days}d)`}
        </span>
      )}
    </span>
  );
}

function getSupplierName(s: any, po?: any): string {
  if (po && po.supplierName) return po.supplierName;
  if (!s) return '';
  if (typeof s === 'string') return s;
  return s.name || '';
}

function getBranchKey(b: any, po?: any): string {
  if (po && po.branchSlug) return po.branchSlug;
  if (!b) return '';
  if (typeof b === 'string') return b;
  return b.slug || b.id || '';
}

export function PurchaseOrders() {
  const navigate = useNavigate();
  const { purchaseOrders, suppliers, branches, branchLabel, setPoStatus } = useStore();
  const [tab, setTab] = useState('All');
  const [supplier, setSupplier] = useState('all');
  const [branch, setBranch] = useState('all');
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  const tabs = useMemo(
    () => [
      { label: 'All', count: purchaseOrders.length },
      ...STATUSES.map((status) => ({
        label: status,
        count: purchaseOrders.filter((po) => po.status === status).length
      }))
    ],
    [purchaseOrders]
  );

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    return purchaseOrders.filter((po) => {
      if (tab !== 'All' && po.status !== tab) return false;
      if (supplier !== 'all' && po.supplierId !== supplier) return false;
      const bKey = getBranchKey(po.branch, po);
      if (branch !== 'all' && bKey !== branch && po.branch !== branch && po.branchSlug !== branch) return false;
      const poNum = po.poNumber || po.id;
      const sName = getSupplierName(po.supplier, po);
      const items = po.items || po.lines || [];
      if (
        term &&
        !poNum.toLowerCase().includes(term) &&
        !sName.toLowerCase().includes(term) &&
        !items.some((l) => (l.name || l.product?.name || '').toLowerCase().includes(term))
      ) {
        return false;
      }
      return true;
    });
  }, [purchaseOrders, tab, supplier, branch, query]);

  const open = purchaseOrders.filter(
    (po) => po.status === 'SENT' || po.status === 'PARTIALLY_RECEIVED'
  );
  const overdue = open.filter((po) => po.expectedAt && daysUntil(po.expectedAt) < 0);
  const onOrder = open.reduce((sum, po) => {
    const items = po.items || po.lines || [];
    return (
      sum +
      items.reduce((n, l) => {
        const ord = l.quantityOrdered ?? l.ordered ?? 0;
        const rec = l.quantityReceived ?? l.received ?? 0;
        return n + (ord - rec) * l.unitCost;
      }, 0)
    );
  }, 0);
  const receivedUnits = purchaseOrders.reduce((sum, po) => {
    const items = po.items || po.lines || [];
    return sum + items.reduce((n, l) => n + (l.quantityReceived ?? l.received ?? 0), 0);
  }, 0);

  function exportCsv() {
    downloadCsv(
      `purchase-orders-${stamp()}`,
      [
        ['PO', 'Supplier', 'Branch', 'Status', 'Lines', 'Units', 'Value', 'Created', 'Expected'],
        ...rows.map((po) => {
          const poNum = po.poNumber || po.id;
          const sName = getSupplierName(po.supplier, po);
          const bKey = getBranchKey(po.branch, po);
          const items = po.items || po.lines || [];
          return [
            poNum,
            sName,
            branchLabel(bKey),
            po.status,
            items.length,
            poUnits(po),
            poTotal(po),
            formatDate(po.createdAt),
            po.expectedAt ? formatDate(po.expectedAt) : '—'
          ];
        })
      ]
    );
    toast.success('Purchase orders exported', { description: `${rows.length} rows` });
  }

  const stats = [
    { label: 'Open orders', value: String(open.length), icon: ClipboardListIcon, tone: 'text-brand-600 bg-brand-50' },
    { label: 'Value on order', value: formatCurrency(onOrder), icon: WalletIcon, tone: 'text-emerald-600 bg-emerald-50' },
    { label: 'Overdue', value: String(overdue.length), icon: AlertCircleIcon, tone: 'text-red-600 bg-red-50' },
    { label: 'Units received', value: receivedUnits.toLocaleString(), icon: PackageCheckIcon, tone: 'text-sky-600 bg-sky-50' }
  ];

  return (
    <AppShell
      title="Purchase Orders"
      actions={
        <>
          <Button variant="secondary" onClick={exportCsv}>
            <DownloadIcon className="h-4 w-4" aria-hidden="true" />
            Export
          </Button>
          <Button variant="primary" onClick={() => setFormOpen(true)}>
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            New Purchase Order
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <li key={stat.label}>
              <Card className="flex items-center gap-3 p-4">
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.tone}`}>
                  <stat.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                  <p className="font-mono text-lg font-semibold tabular text-slate-900">
                    {stat.value}
                  </p>
                </div>
              </Card>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-2">
          <Segmented options={tabs} value={tab} onChange={setTab} />
          <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
            <div className="relative">
              <SearchIcon
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search PO, supplier or product"
                aria-label="Search purchase orders"
                className="h-9 w-64 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <Select
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              aria-label="Filter by supplier"
            >
              <option value="all">All suppliers</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
            <Select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              aria-label="Filter by branch"
            >
              <option value="all">All branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.slug || b.id}>
                  {b.shortName || b.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="max-h-[620px] overflow-auto thin-scroll">
            <table className="w-full min-w-[1040px] border-collapse text-sm">
              <thead>
                <tr>
                  <Th>PO Number</Th>
                  <Th>Supplier</Th>
                  <Th>Branch</Th>
                  <Th align="right">Lines</Th>
                  <Th align="right">Total Value</Th>
                  <Th>Received</Th>
                  <Th>Status</Th>
                  <Th>Created</Th>
                  <Th>Expected</Th>
                  <Th align="right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((po) => {
                  const progress = poProgress(po);
                  const poNum = po.poNumber || po.id;
                  const sName = getSupplierName(po.supplier, po);
                  const bKey = getBranchKey(po.branch, po);
                  const items = po.items || po.lines || [];

                  return (
                    <Tr key={po.id}>
                      <Td>
                        <Link
                          to={`/purchase-orders/${po.poNumber || po.id}`}
                          className="font-mono text-sm font-medium text-brand-600 hover:underline"
                        >
                          {poNum}
                        </Link>
                      </Td>
                      <Td className="text-slate-900">{sName}</Td>
                      <Td className="whitespace-nowrap text-slate-600">{branchLabel(bKey)}</Td>
                      <Td align="right" className="font-mono tabular text-slate-600">
                        {items.length}
                      </Td>
                      <Td align="right" className="font-mono tabular font-medium text-slate-900">
                        {formatCurrency(poTotal(po))}
                      </Td>
                      <Td>
                        <div className="flex w-28 items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full ${
                                progress === 100 ? 'bg-emerald-500' : 'bg-brand-500'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs tabular text-slate-500">
                            {progress}%
                          </span>
                        </div>
                      </Td>
                      <Td>
                        <Badge tone={poStatusTones[po.status] || 'gray'} dot>
                          {po.status}
                        </Badge>
                      </Td>
                      <Td className="whitespace-nowrap text-slate-500">
                        {formatDate(po.createdAt)}
                      </Td>
                      <Td>
                        <ExpectedCell iso={po.expectedAt} status={po.status} />
                      </Td>
                      <Td align="right">
                        <div className="flex items-center justify-end gap-1.5">
                          {po.status === 'DRAFT' && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) => {
                                e.preventDefault();
                                setPoStatus(po.id, 'SENT');
                              }}
                            >
                              Send
                            </Button>
                          )}
                          {(po.status === 'SENT' || po.status === 'PARTIALLY_RECEIVED') && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={(e) => {
                                e.preventDefault();
                                navigate(`/purchase-orders/${po.poNumber || po.id}`);
                              }}
                            >
                              Receive
                            </Button>
                          )}
                          {(po.status === 'DRAFT' || po.status === 'SENT') && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) => {
                                e.preventDefault();
                                setPoStatus(po.id, 'CANCELLED');
                              }}
                            >
                              Cancel
                            </Button>
                          )}
                          {(po.status === 'RECEIVED' || po.status === 'CLOSED' || po.status === 'CANCELLED') && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) => {
                                e.preventDefault();
                                navigate(`/purchase-orders/${po.poNumber || po.id}`);
                              }}
                            >
                              View
                            </Button>
                          )}
                        </div>
                      </Td>
                    </Tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {rows.length === 0 && (
            <div className="px-6 py-14 text-center">
              <p className="text-sm font-medium text-slate-900">No purchase orders match</p>
              <p className="mt-1 text-sm text-slate-500">
                Try a different status, supplier or search term.
              </p>
            </div>
          )}
        </Card>
      </div>

      <PurchaseOrderFormModal open={formOpen} onClose={() => setFormOpen(false)} />
    </AppShell>
  );
}