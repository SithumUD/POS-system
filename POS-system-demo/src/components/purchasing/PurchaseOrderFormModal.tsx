import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { PlusIcon, Trash2Icon, SparklesIcon } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Field, Input, Select, Textarea } from '../ui/Field';
import { useStore } from '../../contexts/StoreContext';
import { PoDraftLine, PurchaseOrder } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { toDateInput, fromDateInput } from '../../utils/time';

interface PurchaseOrderFormModalProps {
  open: boolean;
  onClose: () => void;
  po?: PurchaseOrder | null;
}

function defaultExpected(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateInput(date.toISOString());
}

function getBranchKey(b: any): string {
  if (!b) return '';
  if (typeof b === 'string') return b;
  return b.slug || b.id || '';
}

export function PurchaseOrderFormModal({ open, onClose, po }: PurchaseOrderFormModalProps) {
  const { suppliers, branches, products, createPurchaseOrder, updatePurchaseOrder } = useStore();
  const editing = Boolean(po);

  const [supplierId, setSupplierId] = useState('');
  const [branch, setBranch] = useState('');
  const [expected, setExpected] = useState(defaultExpected(5));
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<PoDraftLine[]>([]);
  const [picker, setPicker] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    const activeSupp = suppliers.find((s) => s.status === 'ACTIVE' || s.status === ('Active' as any));
    const supplier = po?.supplierId ?? activeSupp?.id ?? '';
    setSupplierId(supplier);
    setBranch(po ? getBranchKey(po.branch) : (branches[0]?.slug || branches[0]?.id || ''));
    setExpected(po && po.expectedAt ? toDateInput(po.expectedAt) : defaultExpected(5));
    setNotes(po?.notes ?? '');
    const poItems = po ? (po.items || po.lines || []) : [];
    setLines(
      poItems.map((l) => ({
        productId: l.productId || (l.product ? l.product.id : ''),
        ordered: l.quantityOrdered ?? l.ordered ?? 0,
        unitCost: l.unitCost ?? 0
      }))
    );
    setPicker('');
    setError('');
  }, [open, po, suppliers, branches]);

  const supplier = suppliers.find((s) => s.id === supplierId);

  const catalogue = useMemo(() => {
    if (!supplier) return products;
    const matching = products.filter((p) => {
      const pSupp = typeof p.preferredSupplier === 'object' ? p.preferredSupplier?.name : (p as any).supplier;
      const catName = typeof p.category === 'object' ? p.category?.name : p.category;
      return pSupp === supplier.name || (supplier.suppliedCategories || (supplier as any).categories || []).includes(catName || '');
    });
    return matching.length > 0 ? matching : products;
  }, [products, supplier]);

  const available = catalogue.filter((p) => !lines.some((l) => l.productId === p.id));
  const total = lines.reduce((sum, l) => sum + l.ordered * l.unitCost, 0);

  function addLine(productId: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const cost = product.costPrice ?? product.cost ?? 0;
    setLines((prev) => [...prev, { productId, ordered: 12, unitCost: Math.round(cost) }]);
    setPicker('');
    setError('');
  }

  function suggestFromLowStock() {
    const suggestions = catalogue
      .filter((p) => {
        const onHand = Object.values(p.stock || {}).reduce((sum, n) => sum + n, 0);
        const thresh = p.reorderThreshold ?? p.threshold ?? 0;
        return p.active && onHand <= thresh * branches.length;
      })
      .slice(0, 6)
      .filter((p) => !lines.some((l) => l.productId === p.id));
    if (suggestions.length === 0) {
      toast.info('No low-stock products for this supplier');
      return;
    }
    setLines((prev) => [
      ...prev,
      ...suggestions.map((p) => {
        const thresh = p.reorderThreshold ?? p.threshold ?? 0;
        const cost = p.costPrice ?? p.cost ?? 0;
        return {
          productId: p.id,
          ordered: Math.max(thresh * 2, 12),
          unitCost: Math.round(cost)
        };
      })
    ]);
    toast.success(`${suggestions.length} low-stock items added`);
  }

  function updateLine(productId: string, patch: Partial<PoDraftLine>) {
    setLines((prev) => prev.map((l) => (l.productId === productId ? { ...l, ...patch } : l)));
  }

  function submit(send: boolean) {
    if (!supplierId) {
      setError('Choose a supplier for this order.');
      return;
    }
    const valid = lines.filter((l) => l.ordered > 0);
    if (valid.length === 0) {
      setError('Add at least one product with a quantity above zero.');
      return;
    }
    const input = {
      supplierId,
      branch,
      expectedAt: fromDateInput(expected),
      notes: notes.trim(),
      lines: valid
    };
    if (po) {
      updatePurchaseOrder(po.id, input);
      toast.success(`${po.poNumber || po.id} updated`, { description: `${valid.length} line items` });
    } else {
      createPurchaseOrder(input, send);
      toast.success(send ? 'Purchase order sent' : 'Draft purchase order saved', {
        description: `${supplier?.name} · ${formatCurrency(total)}`
      });
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="max-w-3xl"
      title={editing ? `Edit ${po?.poNumber || po?.id}` : 'New purchase order'}
      subtitle={
        editing
          ? 'Changes are recorded on the order activity log.'
          : 'Received quantities post straight into branch stock.'
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          {editing ? (
            <Button variant="primary" onClick={() => submit(false)}>
              Save changes
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => submit(false)}>
                Save as draft
              </Button>
              <Button variant="primary" onClick={() => submit(true)}>
                Create &amp; send
              </Button>
            </>
          )}
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Supplier" className="sm:col-span-2">
            <Select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
              <option value="">Select a supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id} disabled={s.status === 'INACTIVE' || s.status === ('Inactive' as any)}>
                  {s.name}
                  {s.status !== 'ACTIVE' && s.status !== ('Active' as any) ? ` (${s.status})` : ''}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Deliver to">
            <Select value={branch} onChange={(e) => setBranch(e.target.value)}>
              {branches.map((b) => (
                <option key={b.id} value={b.slug || b.id}>
                  {b.shortName || b.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Expected delivery"
            hint={supplier ? `Typical lead time ${supplier.leadTimeDays} days` : undefined}
          >
            <Input type="date" value={expected} onChange={(e) => setExpected(e.target.value)} />
          </Field>
          <Field label="Payment terms" className="sm:col-span-2">
            <Input value={supplier?.paymentTerms ?? '—'} readOnly className="bg-slate-50" />
          </Field>
        </div>

        <div className="rounded-lg border border-slate-200">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50/60 px-3 py-2.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Line items
            </span>
            <div className="ml-auto flex items-center gap-2">
              <Select
                value={picker}
                onChange={(e) => addLine(e.target.value)}
                className="min-w-[220px]"
              >
                <option value="">Add product…</option>
                {available.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
              <Button size="sm" variant="secondary" onClick={suggestFromLowStock}>
                <SparklesIcon className="h-3.5 w-3.5" aria-hidden="true" />
                Suggest
              </Button>
            </div>
          </div>

          {lines.length === 0 ? (
            <p className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-slate-500">
              <PlusIcon className="h-4 w-4" aria-hidden="true" />
              Add products to this order to get started.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {lines.map((line) => {
                const product = products.find((p) => p.id === line.productId);
                return (
                  <li key={line.productId} className="flex items-center gap-3 px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {product?.name ?? line.productId}
                      </p>
                      <p className="font-mono text-xs text-slate-500">{product?.sku}</p>
                    </div>
                    <label className="w-20">
                      <span className="mb-1 block text-[11px] text-slate-500">Qty</span>
                      <Input
                        type="number"
                        min={0}
                        value={line.ordered}
                        onChange={(e) =>
                          updateLine(line.productId, { ordered: Number(e.target.value) || 0 })
                        }
                        className="font-mono tabular"
                      />
                    </label>
                    <label className="w-24">
                      <span className="mb-1 block text-[11px] text-slate-500">Unit cost</span>
                      <Input
                        type="number"
                        min={0}
                        value={line.unitCost}
                        onChange={(e) =>
                          updateLine(line.productId, { unitCost: Number(e.target.value) || 0 })
                        }
                        className="font-mono tabular"
                      />
                    </label>
                    <span className="w-28 pt-4 text-right font-mono text-sm tabular text-slate-900">
                      {formatCurrency(line.ordered * line.unitCost)}
                    </span>
                    <button
                      onClick={() =>
                        setLines((prev) => prev.filter((l) => l.productId !== line.productId))
                      }
                      aria-label={`Remove ${product?.name ?? 'line'}`}
                      className="mt-4 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2Icon className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-3 py-2.5">
            <span className="text-sm text-slate-600">
              {lines.length} line{lines.length === 1 ? '' : 's'} ·{' '}
              {lines.reduce((sum, l) => sum + l.ordered, 0)} units
            </span>
            <span className="font-mono text-sm font-semibold tabular text-slate-900">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        <Field label="Notes for the supplier" error={error}>
          <Textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Deliver before 10 AM. Call the receiving bay on arrival."
          />
        </Field>
      </div>
    </Modal>
  );
}