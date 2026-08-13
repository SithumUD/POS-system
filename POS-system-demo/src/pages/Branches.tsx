import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  PlusIcon,
  MapPinIcon,
  UsersIcon,
  ArrowLeftRightIcon,
  MonitorIcon,
  PhoneIcon,
  ClockIcon,
  SettingsIcon,
  CheckIcon,
  Trash2Icon,
  TruckIcon,
  XCircleIcon
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Th, Td, Tr } from '../components/ui/Table';
import { BranchFormModal } from '../components/operations/BranchFormModal';
import { TransferStockModal } from '../components/operations/TransferStockModal';
import { TransferDetailsModal } from '../components/operations/TransferDetailsModal';
import { stockState } from '../data/products';
import { useStore } from '../contexts/StoreContext';
import { formatCurrency } from '../utils/currency';
import { formatShortDateTime } from '../utils/time';
import { summaryStats, withinDays } from '../utils/analytics';
import { Branch, BranchStatus, TransferStatus, Transfer } from '../types';

const statusTones: Record<BranchStatus, 'green' | 'amber' | 'blue'> = {
  OPEN: 'green',
  CLOSED: 'amber',
  SETUP: 'blue'
};

const transferTones: Record<TransferStatus, 'blue' | 'green' | 'slate'> = {
  IN_TRANSIT: 'blue',
  COMPLETED: 'green',
  CANCELLED: 'slate'
};

function getBranchKey(b: Branch): string {
  return b.slug || b.id;
}

function getBranchDisplayName(b: Branch): string {
  return b.shortName || b.name || b.slug || b.id;
}

function getManagerName(b: Branch): string {
  if (!b.manager) return 'unassigned';
  if (typeof b.manager === 'string') return b.manager;
  return b.manager.name || 'unassigned';
}

export function Branches() {
  const {
    products,
    sales,
    branches,
    users,
    branch: activeBranch,
    setBranch,
    transfers,
    completeTransfer,
    cancelTransfer,
    deleteBranch,
    branchLabel
  } = useStore();
  const [transferOpen, setTransferOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);

  const metrics = useMemo(() => {
    const result: Record<string, { stockValue: number; lowStock: number; today: number; week: number; orders: number; staffCount: number }> = {};
    branches.forEach((branch) => {
      const bKey = getBranchKey(branch);
      const staffCount = users?.filter((u) => {
        const uBranchKey = typeof u.branch === 'object' ? u.branch?.slug || u.branch?.id : u.branch;
        const uAssignedKey = typeof u.assignedBranch === 'object' ? u.assignedBranch?.slug || u.assignedBranch?.id : u.assignedBranch;
        return (uBranchKey === bKey || uBranchKey === branch.id) || (uAssignedKey === bKey || uAssignedKey === branch.id);
      }).length || 0;

      let stockValue = 0;
      let lowStock = 0;
      products.forEach((product) => {
        const qty = product.stock?.[bKey] ?? product.stock?.[branch.id] ?? 0;
        const cPrice = product.costPrice ?? product.cost ?? 0;
        const thresh = product.reorderThreshold ?? product.threshold ?? 0;
        stockValue += qty * cPrice;
        const state = stockState(qty, thresh);
        if (state === 'low-stock' || state === 'out-of-stock') lowStock += 1;
      });
      const branchSales = sales.filter((s) => {
        const sKey = typeof s.branch === 'string' ? s.branch : (s as any).branch?.slug || (s as any).branchSlug || '';
        return sKey === bKey || sKey === branch.id;
      });
      const today = summaryStats(branchSales.filter((s) => withinDays(s.soldAt || s.createdAt || (s as any).at || '', 1)));
      const week = summaryStats(branchSales.filter((s) => withinDays(s.soldAt || s.createdAt || (s as any).at || '', 7)));
      result[bKey] = {
        stockValue,
        lowStock,
        today: today.revenue,
        week: week.revenue,
        orders: week.orders,
        staffCount
      };
    });
    return result;
  }, [sales, products, branches, users]);

  function handleDelete(branch: Branch) {
    if (branches.length <= 1) {
      toast.error('You need at least one branch');
      return;
    }
    const bKey = getBranchKey(branch);
    const value = metrics[bKey]?.stockValue ?? 0;
    if (value > 0) {
      toast.error('Branch still holds stock', {
        description: `Transfer out ${formatCurrency(value)} of inventory before removing ${getBranchDisplayName(branch)}.`
      });
      return;
    }
    deleteBranch(branch.id || bKey);
    toast.success(`${getBranchDisplayName(branch)} removed`);
  }

  return (
    <AppShell
      title="Branches"
      actions={
        <>
          <Button variant="secondary" onClick={() => setTransferOpen(true)}>
            <ArrowLeftRightIcon className="h-4 w-4" aria-hidden="true" />
            Transfer Stock
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            Add Branch
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {branches.map((branch) => {
            const bKey = getBranchKey(branch);
            const stat = metrics[bKey];
            const isActive = bKey === activeBranch || branch.id === activeBranch;
            const shortDisp = getBranchDisplayName(branch);
            const managerDisp = getManagerName(branch);

            return (
              <li key={branch.id}>
                <Card className={`flex h-full flex-col p-5 ${isActive ? 'ring-1 ring-brand-200' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold text-slate-900">{branch.name}</h2>
                      <p className="mt-1 inline-flex items-start gap-1.5 text-xs leading-relaxed text-slate-500">
                        <MapPinIcon className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {branch.address}
                      </p>
                    </div>
                    <Badge tone={statusTones[branch.status] || 'green'} dot>
                      {branch.status}
                    </Badge>
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-inset ring-slate-100">
                      <dt className="text-[11px] text-slate-500">Sales today</dt>
                      <dd className="font-mono text-sm font-semibold tabular text-slate-900">
                        {formatCurrency(stat?.today ?? 0)}
                      </dd>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-inset ring-slate-100">
                      <dt className="text-[11px] text-slate-500">Sales this week</dt>
                      <dd className="font-mono text-sm font-semibold tabular text-slate-900">
                        {formatCurrency(stat?.week ?? 0)}
                      </dd>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-inset ring-slate-100">
                      <dt className="text-[11px] text-slate-500">Stock value</dt>
                      <dd className="font-mono text-sm font-semibold tabular text-slate-900">
                        {formatCurrency(stat?.stockValue ?? 0)}
                      </dd>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-inset ring-slate-100">
                      <dt className="text-[11px] text-slate-500">Low / out of stock</dt>
                      <dd
                        className={`font-mono text-sm font-semibold tabular ${
                          (stat?.lowStock ?? 0) > 0 ? 'text-amber-600' : 'text-slate-900'
                        }`}
                      >
                        {stat?.lowStock ?? 0} SKUs
                      </dd>
                    </div>
                  </dl>

                  <dl className="mt-4 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MonitorIcon className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                      {branch.terminalCount} POS terminals
                    </div>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                      {branch.opensAt} – {branch.closesAt}
                    </div>
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                      <span className="font-mono tabular">{branch.phone || '—'}</span>
                    </div>
                  </dl>

                  <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                    {isActive ? (
                      <Badge tone="blue" dot>
                        Active terminal
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setBranch(bKey);
                          toast.success(`Switched to ${shortDisp}`);
                        }}
                      >
                        <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        Set active
                      </Button>
                    )}
                    <div className="ml-auto flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(branch)}>
                        <Trash2Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditing(branch);
                          setFormOpen(true);
                        }}
                      >
                        <SettingsIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        Manage
                      </Button>
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>

        <Card className="overflow-hidden">
          <CardHeader
            title="Stock transfers"
            subtitle="Stock leaves the source immediately and lands when marked received."
            action={
              <Button size="sm" variant="secondary" onClick={() => setTransferOpen(true)}>
                <TruckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                New transfer
              </Button>
            }
          />

          <div className="overflow-x-auto thin-scroll">
            <table className="w-full min-w-[860px] border-collapse text-sm">
              <thead>
                <tr>
                  <Th>Transfer</Th>
                  <Th>Route</Th>
                  <Th>Items</Th>
                  <Th align="right">Units</Th>
                  <Th>Created</Th>
                  <Th>Status</Th>
                  <Th align="right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((transfer) => {
                  const trfNum = transfer.transferNumber || transfer.id;
                  const fromKey = transfer.fromBranchSlug || (typeof transfer.fromBranch === 'string' ? transfer.fromBranch : (transfer.fromBranch?.slug || ''));
                  const toKey = transfer.toBranchSlug || (typeof transfer.toBranch === 'string' ? transfer.toBranch : (transfer.toBranch?.slug || ''));
                  const trfItems = (transfer.items || transfer.lines || []) as any[];

                  return (
                    <Tr key={transfer.id}>
                      <Td className="font-mono text-sm font-medium text-slate-900">{trfNum}</Td>
                      <Td className="whitespace-nowrap text-slate-600">
                        {branchLabel(fromKey)} → {branchLabel(toKey)}
                      </Td>
                      <Td className="text-slate-600">
                        {trfItems.map((l) => l.productName || l.productNameSnapshot || l.name || l.product?.name).filter(Boolean).join(', ')}
                      </Td>
                      <Td align="right" className="font-mono tabular text-slate-600">
                        {trfItems.reduce((sum, l) => sum + (l.quantity ?? l.qty ?? 0), 0)}
                      </Td>
                      <Td className="whitespace-nowrap text-slate-500">
                        {formatShortDateTime(transfer.createdAt)}
                      </Td>
                      <Td>
                        <Badge tone={transferTones[transfer.status] || 'blue'} dot>
                          {transfer.status}
                        </Badge>
                      </Td>
                      <Td align="right">
                        <div className="flex items-center justify-end gap-1">
                          {transfer.status === 'IN_TRANSIT' ? (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  cancelTransfer(transfer.id);
                                  toast.success(`${trfNum} cancelled`, {
                                    description: 'Stock returned to the source branch.'
                                  });
                                }}
                              >
                                <XCircleIcon className="h-3.5 w-3.5" aria-hidden="true" />
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  completeTransfer(transfer.id);
                                  toast.success(`${trfNum} received`, {
                                    description: `Stock added to ${branchLabel(toKey)}.`
                                  });
                                }}
                              >
                                Mark received
                              </Button>
                            </>
                          ) : (
                            <span className="text-xs text-slate-400 mr-2">
                              {transfer.completedAt ? formatShortDateTime(transfer.completedAt) : '—'}
                            </span>
                          )}
                          <Button size="sm" variant="secondary" onClick={() => setSelectedTransfer(transfer)}>
                            View
                          </Button>
                        </div>
                      </Td>
                    </Tr>
                  );
                })}
              </tbody>
            </table>
            {transfers.length === 0 && (
              <p className="py-14 text-center text-sm text-slate-500">No transfers recorded yet.</p>
            )}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader title="Branch comparison" subtitle="Last 7 days" />
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <Th>Branch</Th>
                <Th align="right">Orders</Th>
                <Th align="right">Revenue</Th>
                <Th align="right">Stock value</Th>
                <Th align="right">Low stock</Th>
              </tr>
            </thead>
            <tbody>
              {branches.map((branch) => {
                const bKey = getBranchKey(branch);
                const stat = metrics[bKey];
                return (
                  <Tr key={branch.id}>
                    <Td className="text-slate-900">{getBranchDisplayName(branch)}</Td>
                    <Td align="right" className="font-mono tabular text-slate-600">
                      {stat?.orders ?? 0}
                    </Td>
                    <Td align="right" className="font-mono tabular font-medium text-slate-900">
                      {formatCurrency(stat?.week ?? 0)}
                    </Td>
                    <Td align="right" className="font-mono tabular text-slate-600">
                      {formatCurrency(stat?.stockValue ?? 0)}
                    </Td>
                    <Td align="right" className="font-mono tabular text-slate-600">
                      {stat?.lowStock ?? 0}
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>

      <TransferStockModal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        fromBranch={activeBranch}
      />
      
      <TransferDetailsModal 
        open={!!selectedTransfer} 
        onClose={() => setSelectedTransfer(null)} 
        transfer={selectedTransfer}
        branchLabel={branchLabel} 
      />

      <BranchFormModal open={formOpen} onClose={() => setFormOpen(false)} branch={editing} />
    </AppShell>
  );
}