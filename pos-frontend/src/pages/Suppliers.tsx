import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  PlusIcon,
  Building2Icon,
  PhoneIcon,
  MailIcon,
  UserIcon,
  SearchIcon,
  PencilIcon,
  Trash2Icon,
  XIcon,
  MapPinIcon,
  DownloadIcon
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Segmented } from '../components/ui/Toolbar';
import { SlideOver } from '../components/ui/Modal';
import { SupplierFormModal } from '../components/purchasing/SupplierFormModal';
import { useStore } from '../contexts/StoreContext';
import { poStatusTones, poTotal } from '../data/purchasing';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/time';
import { downloadCsv, stamp } from '../utils/csv';
import { Supplier, SupplierStatus } from '../types';

const statusTones: Record<string, 'green' | 'amber' | 'slate'> = {
  ACTIVE: 'green',
  Active: 'green',
  ON_HOLD: 'amber',
  'On Hold': 'amber',
  INACTIVE: 'slate',
  Inactive: 'slate'
};

function getSuppName(s: any): string {
  if (!s) return '';
  if (typeof s === 'string') return s;
  return s.name || '';
}

export function Suppliers() {
  const { suppliers, purchaseOrders, products, deleteSupplier } = useStore();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('All');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [viewing, setViewing] = useState<Supplier | null>(null);

  const metrics = useMemo(() => {
    const map = new Map<string, { open: number; spend: number; products: number }>();
    suppliers.forEach((supplier) => {
      const orders = purchaseOrders.filter(
        (po) => po.supplierId === supplier.id || getSuppName(po.supplier) === supplier.name
      );
      const prods = products.filter((p) => {
        const pSupp = typeof p.preferredSupplier === 'object' ? p.preferredSupplier?.name : (p as any).supplier;
        return pSupp === supplier.name;
      });
      map.set(supplier.id, {
        open: orders.filter((po) => po.status === 'SENT' || po.status === 'PARTIALLY_RECEIVED' || po.status === ('Sent' as any) || po.status === ('Partially Received' as any)).length,
        spend: orders
          .filter((po) => po.status !== 'CANCELLED' && po.status !== 'DRAFT' && po.status !== ('Cancelled' as any) && po.status !== ('Draft' as any))
          .reduce((sum, po) => sum + poTotal(po), 0),
        products: prods.length
      });
    });
    return map;
  }, [suppliers, purchaseOrders, products]);

  const tabs = [
    { label: 'All', count: suppliers.length },
    { label: 'ACTIVE', count: suppliers.filter((s) => s.status === 'ACTIVE' || s.status === ('Active' as any)).length },
    { label: 'ON_HOLD', count: suppliers.filter((s) => s.status === 'ON_HOLD' || s.status === ('On Hold' as any)).length },
    { label: 'INACTIVE', count: suppliers.filter((s) => s.status === 'INACTIVE' || s.status === ('Inactive' as any)).length }
  ];

  const rows = suppliers.filter((supplier) => {
    if (tab !== 'All' && supplier.status !== tab) return false;
    const term = query.trim().toLowerCase();
    if (!term) return true;
    const cPerson = supplier.contactPerson ?? supplier.contact ?? '';
    const cEmail = supplier.contactEmail ?? supplier.email ?? '';
    return (
      supplier.name.toLowerCase().includes(term) ||
      cPerson.toLowerCase().includes(term) ||
      cEmail.toLowerCase().includes(term)
    );
  });

  function handleDelete(supplier: Supplier) {
    const open = metrics.get(supplier.id)?.open ?? 0;
    if (open > 0) {
      toast.error('Cannot remove supplier', {
        description: `${supplier.name} still has ${open} open purchase order${open > 1 ? 's' : ''}.`
      });
      return;
    }
    deleteSupplier(supplier.id);
    setViewing(null);
    toast.success(`${supplier.name} removed`);
  }

  function exportCsv() {
    downloadCsv(
      `suppliers-${stamp()}`,
      [
        ['Supplier', 'Contact', 'Phone', 'Email', 'Terms', 'Lead time', 'Status', 'Open POs', 'Spend'],
        ...rows.map((s) => [
          s.name,
          s.contactPerson ?? s.contact ?? '',
          s.contactPhone ?? s.phone ?? '',
          s.contactEmail ?? s.email ?? '',
          s.paymentTerms,
          s.leadTimeDays,
          s.status,
          metrics.get(s.id)?.open ?? 0,
          metrics.get(s.id)?.spend ?? 0
        ])
      ]
    );
    toast.success('Suppliers exported', { description: `${rows.length} rows` });
  }

  const viewingOrders = viewing
    ? purchaseOrders.filter((po) => po.supplierId === viewing.id || getSuppName(po.supplier) === viewing.name)
    : [];
  const viewingProducts = viewing
    ? products.filter((p) => {
        const pSupp = typeof p.preferredSupplier === 'object' ? p.preferredSupplier?.name : (p as any).supplier;
        return pSupp === viewing.name;
      })
    : [];

  return (
    <AppShell
      title="Suppliers"
      actions={
        <>
          <Button variant="secondary" onClick={exportCsv}>
            <DownloadIcon className="h-4 w-4" aria-hidden="true" />
            Export
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            Add Supplier
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Segmented options={tabs} value={tab} onChange={setTab} />
          <div className="relative ml-auto">
            <SearchIcon
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search suppliers"
              aria-label="Search suppliers"
              className="h-9 w-64 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        {rows.length === 0 ? (
          <Card className="px-6 py-16 text-center">
            <p className="text-sm font-medium text-slate-900">No suppliers found</p>
            <p className="mt-1 text-sm text-slate-500">Adjust the filters or add a new supplier.</p>
          </Card>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((supplier) => {
              const stat = metrics.get(supplier.id);
              const cPerson = supplier.contactPerson ?? supplier.contact ?? '';
              const cPhone = supplier.contactPhone ?? supplier.phone ?? '';
              const cEmail = supplier.contactEmail ?? supplier.email ?? '';
              return (
                <li key={supplier.id}>
                  <Card className="flex h-full flex-col p-5 transition-colors hover:border-brand-200">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                        <Building2Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-sm font-semibold leading-snug text-slate-900">
                          {supplier.name}
                        </h2>
                        <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-slate-500">
                          <UserIcon className="h-3 w-3" aria-hidden="true" />
                          {cPerson}
                        </p>
                      </div>
                      <Badge tone={statusTones[supplier.status] || 'slate'}>{supplier.status}</Badge>
                    </div>

                    <dl className="mt-4 space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-slate-600">
                        <PhoneIcon className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                        <span className="font-mono tabular">{cPhone || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <MailIcon className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                        <span className="truncate">{cEmail || '—'}</span>
                      </div>
                    </dl>

                    <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3 text-center ring-1 ring-inset ring-slate-100">
                      <div>
                        <p className="font-mono text-sm font-semibold tabular text-slate-900">
                          {stat?.products ?? 0}
                        </p>
                        <p className="text-[11px] text-slate-500">Products</p>
                      </div>
                      <div>
                        <p className="font-mono text-sm font-semibold tabular text-slate-900">
                          {stat?.open ?? 0}
                        </p>
                        <p className="text-[11px] text-slate-500">Open POs</p>
                      </div>
                      <div>
                        <p className="font-mono text-sm font-semibold tabular text-slate-900">
                          {supplier.leadTimeDays}d
                        </p>
                        <p className="text-[11px] text-slate-500">Lead time</p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="font-mono text-xs tabular text-slate-500">
                        {formatCurrency(stat?.spend ?? 0)} ordered
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditing(supplier);
                            setFormOpen(true);
                          }}
                        >
                          <PencilIcon className="h-3.5 w-3.5" aria-hidden="true" />
                          Edit
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => setViewing(supplier)}>
                          View
                        </Button>
                      </div>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <SupplierFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        supplier={editing}
      />

      <SlideOver
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        label="Supplier detail"
        width="max-w-xl"
      >
        {viewing && (
          <div className="flex h-full flex-col">
            <div className="flex items-start gap-3 border-b border-slate-200 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Building2Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-slate-900">{viewing.name}</h2>
                <p className="text-sm text-slate-500">
                  {viewing.contactPerson ?? viewing.contact ?? ''} · added {formatDate(viewing.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setViewing(null)}
                aria-label="Close supplier detail"
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <XIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-5 thin-scroll">
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs text-slate-500">Phone</dt>
                  <dd className="font-mono tabular text-slate-900">
                    {viewing.contactPhone ?? viewing.phone ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Email</dt>
                  <dd className="truncate text-slate-900">
                    {viewing.contactEmail ?? viewing.email ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Payment terms</dt>
                  <dd className="text-slate-900">{viewing.paymentTerms}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Lead time</dt>
                  <dd className="text-slate-900">{viewing.leadTimeDays} days</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs text-slate-500">Address</dt>
                  <dd className="flex items-start gap-1.5 text-slate-900">
                    <MapPinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                    {viewing.address || '—'}
                  </dd>
                </div>
              </dl>

              <div className="flex flex-wrap gap-2">
                {(viewing.suppliedCategories ?? viewing.categories ?? []).map((category) => (
                  <Badge key={category} tone="blue">
                    {category}
                  </Badge>
                ))}
              </div>

              {viewing.notes && (
                <p className="rounded-lg bg-slate-50 px-3 py-2.5 text-sm text-slate-600 ring-1 ring-inset ring-slate-100">
                  {viewing.notes}
                </p>
              )}

              <div>
                <CardHeader title="Purchase orders" subtitle={`${viewingOrders.length} total`} className="mb-2" />
                {viewingOrders.length === 0 ? (
                  <p className="text-sm text-slate-500">No orders raised with this supplier yet.</p>
                ) : (
                  <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                    {viewingOrders.map((po) => (
                      <li key={po.id} className="flex items-center gap-3 px-3 py-2.5">
                        <Link
                          to={`/purchase-orders/${po.poNumber || po.id}`}
                          className="font-mono text-sm font-medium text-brand-600 hover:underline"
                        >
                          {po.poNumber || po.id}
                        </Link>
                        <Badge tone={poStatusTones[po.status] || 'slate'}>{po.status}</Badge>
                        <span className="ml-auto font-mono text-sm tabular text-slate-900">
                          {formatCurrency(poTotal(po))}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <CardHeader
                  title="Catalogue"
                  subtitle={`${viewingProducts.length} products sourced`}
                  className="mb-2"
                />

                {viewingProducts.length === 0 ? (
                  <p className="text-sm text-slate-500">No products list this supplier.</p>
                ) : (
                  <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                    {viewingProducts.slice(0, 8).map((product) => {
                      const cost = product.costPrice ?? product.cost ?? 0;
                      return (
                        <li key={product.id} className="flex items-center gap-3 px-3 py-2">
                          <span className="min-w-0 flex-1 truncate text-sm text-slate-900">
                            {product.name}
                          </span>
                          <span className="font-mono text-xs tabular text-slate-500">
                            {formatCurrency(cost)} cost
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-slate-200 p-4">
              <Button variant="danger" onClick={() => handleDelete(viewing)}>
                <Trash2Icon className="h-4 w-4" aria-hidden="true" />
                Remove
              </Button>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="secondary" onClick={() => setViewing(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setEditing(viewing);
                    setViewing(null);
                    setFormOpen(true);
                  }}
                >
                  <PencilIcon className="h-4 w-4" aria-hidden="true" />
                  Edit supplier
                </Button>
              </div>
            </div>
          </div>
        )}
      </SlideOver>
    </AppShell>
  );
}