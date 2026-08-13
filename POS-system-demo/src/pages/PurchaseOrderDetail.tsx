import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeftIcon,
  Building2Icon,
  CalendarIcon,
  CheckCircle2Icon,
  DownloadIcon,
  MailIcon,
  MapPinIcon,
  PackageCheckIcon,
  PencilIcon,
  PhoneIcon,
  XCircleIcon
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Th, Td, Tr } from '../components/ui/Table';
import { ReceiveStockModal } from '../components/purchasing/ReceiveStockModal';
import { PurchaseOrderFormModal } from '../components/purchasing/PurchaseOrderFormModal';
import { useStore } from '../contexts/StoreContext';
import { poStatusTones, poProgress, poTotal, poUnits } from '../data/purchasing';
import { formatCurrency } from '../utils/currency';
import { formatDate, formatShortDateTime, relativeTime } from '../utils/time';
import { downloadCsv } from '../utils/csv';

function getSupplierName(s: any): string {
  if (!s) return '';
  if (typeof s === 'string') return s;
  return s.name || '';
}

function getBranchKey(b: any): string {
  if (!b) return '';
  if (typeof b === 'string') return b;
  return b.slug || b.id || '';
}

export function PurchaseOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { purchaseOrders, suppliers, branchLabel, setPoStatus, settings } = useStore();
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const po = purchaseOrders.find((entry) => entry.poNumber === id || entry.id === id);

  if (!po) {
    return (
      <AppShell title="Purchase Order">
        <Card className="px-6 py-16 text-center">
          <h2 className="text-sm font-semibold text-slate-900">Purchase order not found</h2>
          <p className="mt-1 text-sm text-slate-500">
            {id} may have been deleted or never existed.
          </p>
          <div className="mt-4">
            <Button variant="primary" onClick={() => navigate('/purchase-orders')}>
              Back to purchase orders
            </Button>
          </div>
        </Card>
      </AppShell>
    );
  }

  const sName = getSupplierName(po.supplier);
  const bKey = getBranchKey(po.branch);
  const poNum = po.poNumber || po.id;
  const items = po.items || po.lines || [];
  const events = po.events || po.activity || [];
  const suppObj = suppliers.find((s) => s.id === po.supplierId || s.name === sName);

  const goods = poTotal(po);
  const tax = Math.round(goods * (settings.taxRate / 100));
  const receivable = po.status === 'SENT' || po.status === 'PARTIALLY_RECEIVED';
  const progress = poProgress(po);

  function exportLines() {
    if (!po) return;
    downloadCsv(
      `${poNum}-lines`,
      [
        ['Product', 'SKU', 'Ordered', 'Received', 'Outstanding', 'Unit cost', 'Line total'],
        ...items.map((l) => {
          const name = l.productNameSnapshot || l.name || l.product?.name || '';
          const ord = l.quantityOrdered ?? l.ordered ?? 0;
          const rec = l.quantityReceived ?? l.received ?? 0;
          const uCost = l.unitCost ?? 0;
          return [name, l.sku, ord, rec, ord - rec, uCost, ord * uCost];
        })
      ]
    );
    toast.success(`${poNum} exported`);
  }

  return (
    <AppShell
      title={`Purchase Order ${poNum}`}
      actions={
        <>
          <Button variant="secondary" onClick={exportLines}>
            <DownloadIcon className="h-4 w-4" aria-hidden="true" />
            Export
          </Button>
          {po.status === 'DRAFT' && (
            <Button
              variant="secondary"
              onClick={() => {
                setPoStatus(po.id, 'SENT');
                toast.success(`${poNum} sent to ${sName}`);
              }}
            >
              <MailIcon className="h-4 w-4" aria-hidden="true" />
              Send to supplier
            </Button>
          )}
          {po.status !== 'RECEIVED' && po.status !== 'CLOSED' && po.status !== 'CANCELLED' && (
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              <PencilIcon className="h-4 w-4" aria-hidden="true" />
              Edit
            </Button>
          )}
          {receivable && (
            <Button variant="primary" onClick={() => setReceiveOpen(true)}>
              <PackageCheckIcon className="h-4 w-4" aria-hidden="true" />
              Receive stock
            </Button>
          )}
          {po.status === 'RECEIVED' && (
            <Button
              variant="primary"
              onClick={() => {
                setPoStatus(po.id, 'CLOSED');
                toast.success(`${poNum} closed`);
              }}
            >
              <CheckCircle2Icon className="h-4 w-4" aria-hidden="true" />
              Close order
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-4">
        <Link
          to="/purchase-orders"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          All purchase orders
        </Link>

        <Card className="p-5">
          <div className="flex flex-wrap items-start gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-mono text-lg font-semibold text-slate-900">{poNum}</h2>
                <Badge tone={poStatusTones[po.status] || 'gray'} dot>
                  {po.status}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                {sName} · delivering to {branchLabel(bKey)}
              </p>
              {po.notes && (
                <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 ring-1 ring-inset ring-slate-100">
                  {po.notes}
                </p>
              )}
            </div>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs text-slate-500">Created</dt>
                <dd className="mt-0.5 font-medium text-slate-900">{formatDate(po.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Expected</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {po.expectedAt ? formatDate(po.expectedAt) : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Fulfilment</dt>
                <dd className="mt-0.5 font-mono font-medium tabular text-slate-900">{progress}%</dd>
              </div>
            </dl>
          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all ${
                progress === 100 ? 'bg-emerald-500' : 'bg-brand-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Card className="overflow-hidden">
              <CardHeader
                title="Line items"
                subtitle={`${items.length} products · ${poUnits(po)} units ordered`}
              />

              <div className="overflow-x-auto thin-scroll">
                <table className="w-full min-w-[720px] border-collapse text-sm">
                  <thead>
                    <tr>
                      <Th>Product</Th>
                      <Th align="right">Ordered</Th>
                      <Th align="right">Received</Th>
                      <Th align="right">Outstanding</Th>
                      <Th align="right">Unit cost</Th>
                      <Th align="right">Line total</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((line, idx) => {
                      const name = line.productNameSnapshot || line.name || line.product?.name || '';
                      const ord = line.quantityOrdered ?? line.ordered ?? 0;
                      const rec = line.quantityReceived ?? line.received ?? 0;
                      const outstanding = ord - rec;
                      const uCost = line.unitCost ?? 0;
                      const lTot = line.lineTotal ?? ord * uCost;

                      return (
                        <Tr key={line.id || line.productId || idx}>
                          <Td>
                            <p className="font-medium text-slate-900">{name}</p>
                            <p className="font-mono text-xs text-slate-500">{line.sku}</p>
                          </Td>
                          <Td align="right" className="font-mono tabular text-slate-600">
                            {ord}
                          </Td>
                          <Td align="right" className="font-mono tabular text-slate-900">
                            {rec}
                          </Td>
                          <Td align="right">
                            <span
                              className={`font-mono tabular ${
                                outstanding > 0 ? 'text-amber-600' : 'text-emerald-600'
                              }`}
                            >
                              {outstanding}
                            </span>
                          </Td>
                          <Td align="right" className="font-mono tabular text-slate-600">
                            {formatCurrency(uCost)}
                          </Td>
                          <Td align="right" className="font-mono tabular font-medium text-slate-900">
                            {formatCurrency(lTot)}
                          </Td>
                        </Tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <dl className="space-y-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-slate-600">Goods value</dt>
                  <dd className="font-mono tabular text-slate-900">{formatCurrency(goods)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-600">
                    {settings.taxLabel} ({settings.taxRate}%)
                  </dt>
                  <dd className="font-mono tabular text-slate-900">{formatCurrency(tax)}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                  <dt className="font-medium text-slate-900">Order total</dt>
                  <dd className="font-mono text-base font-bold tabular text-slate-900">
                    {formatCurrency(goods + tax)}
                  </dd>
                </div>
              </dl>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-5">
              <CardHeader title="Supplier" className="mb-3" />
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Building2Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{sName}</p>
                  <p className="text-xs text-slate-500">
                    {suppObj?.contactPerson ?? (suppObj as any)?.contact ?? '—'}
                  </p>
                </div>
              </div>
              <dl className="mt-4 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <PhoneIcon className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                  <span className="font-mono tabular">{suppObj?.contactPhone ?? suppObj?.phone ?? '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MailIcon className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                  <span className="truncate">{suppObj?.contactEmail ?? suppObj?.email ?? '—'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPinIcon className="mt-px h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                  <span>{suppObj?.address ?? '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                  <span>
                    {suppObj?.paymentTerms ?? '—'} · {suppObj?.leadTimeDays ?? '—'} day lead time
                  </span>
                </div>
              </dl>
              {suppObj && (
                <Link
                  to="/suppliers"
                  className="mt-4 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  View supplier profile
                </Link>
              )}
            </Card>

            <Card className="p-5">
              <CardHeader title="Activity" className="mb-3" />
              <ol className="space-y-3">
                {[...events].reverse().map((entry) => {
                  const rawActor = entry.actorName || entry.actor;
                  const actorStr = typeof rawActor === 'object' ? rawActor?.name ?? 'System' : rawActor || 'System';
                  const atTime = entry.occurredAt || entry.at || '';
                  const desc = entry.description || entry.text || '';
                  return (
                    <li key={entry.id} className="flex gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                      <div className="min-w-0">
                        <p className="text-sm text-slate-900">{desc}</p>
                        <p className="text-xs text-slate-500">
                          {actorStr} · {formatShortDateTime(atTime)} ({relativeTime(atTime)})
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Card>

            {po.status !== 'CANCELLED' && po.status !== 'CLOSED' && po.status !== 'RECEIVED' && (
              <Card className="p-5">
                <CardHeader title="Danger zone" subtitle="Cancelling keeps the record for audit." className="mb-3" />
                <Button
                  variant="danger"
                  onClick={() => {
                    setPoStatus(po.id, 'CANCELLED');
                    toast.success(`${poNum} cancelled`);
                  }}
                >
                  <XCircleIcon className="h-4 w-4" aria-hidden="true" />
                  Cancel purchase order
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>

      <ReceiveStockModal open={receiveOpen} onClose={() => setReceiveOpen(false)} po={po} />
      <PurchaseOrderFormModal open={editOpen} onClose={() => setEditOpen(false)} po={po} />
    </AppShell>
  );
}