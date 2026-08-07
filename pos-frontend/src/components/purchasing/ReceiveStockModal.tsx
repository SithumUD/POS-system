import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { PackageCheckIcon } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Field, Input, Textarea } from '../ui/Field';
import { useStore } from '../../contexts/StoreContext';
import { PurchaseOrder } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface ReceiveStockModalProps {
  open: boolean;
  onClose: () => void;
  po: PurchaseOrder;
}

function getBranchKey(b: any): string {
  if (!b) return '';
  if (typeof b === 'string') return b;
  return b.slug || b.id || '';
}

export function ReceiveStockModal({ open, onClose, po }: ReceiveStockModalProps) {
  const { receivePurchaseOrder, branchLabel } = useStore();
  const [receipts, setReceipts] = useState<Record<string, number>>({});
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const items = useMemo(() => po?.items || po?.lines || [], [po]);

  const outstanding = useMemo(
    () =>
      items.filter((line) => {
        const ord = line.quantityOrdered ?? line.ordered ?? 0;
        const rec = line.quantityReceived ?? line.received ?? 0;
        return ord - rec > 0;
      }),
    [items]
  );

  useEffect(() => {
    if (!open) return;
    const next: Record<string, number> = {};
    outstanding.forEach((line) => {
      const pId = line.productId || (line.product ? line.product.id : '');
      const ord = line.quantityOrdered ?? line.ordered ?? 0;
      const rec = line.quantityReceived ?? line.received ?? 0;
      next[pId] = ord - rec;
    });
    setReceipts(next);
    setNote('');
    setError('');
  }, [open, outstanding]);

  const units = Object.values(receipts).reduce((sum, n) => sum + (Number(n) || 0), 0);
  const value = outstanding.reduce((sum, line) => {
    const pId = line.productId || (line.product ? line.product.id : '');
    return sum + (Number(receipts[pId]) || 0) * (line.unitCost ?? 0);
  }, 0);

  const poNum = po.poNumber || po.id;
  const bKey = getBranchKey(po.branch);

  function handleConfirm() {
    if (units <= 0) {
      setError('Enter at least one received quantity.');
      return;
    }
    receivePurchaseOrder(po.id, receipts, note);
    toast.success('Stock received', {
      description: `${units} units added to ${branchLabel(bKey)} · ${formatCurrency(value)}`
    });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="max-w-2xl"
      title={`Receive stock — ${poNum}`}
      subtitle={`Quantities post directly to ${branchLabel(bKey)} on-hand stock.`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            <PackageCheckIcon className="h-4 w-4" aria-hidden="true" />
            Confirm receipt
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {outstanding.length === 0 ? (
          <p className="rounded-lg bg-emerald-50 px-4 py-6 text-center text-sm text-emerald-800 ring-1 ring-inset ring-emerald-200">
            Every line on this order has been fully received.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2 text-right">Ordered</th>
                  <th className="px-3 py-2 text-right">Already in</th>
                  <th className="px-3 py-2 text-right">Receiving now</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {outstanding.map((line, idx) => {
                  const pId = line.productId || (line.product ? line.product.id : String(idx));
                  const name = line.productNameSnapshot || line.name || line.product?.name || '';
                  const ord = line.quantityOrdered ?? line.ordered ?? 0;
                  const rec = line.quantityReceived ?? line.received ?? 0;
                  const remaining = ord - rec;
                  return (
                    <tr key={pId || idx}>
                      <td className="px-3 py-2.5">
                        <p className="font-medium text-slate-900">{name}</p>
                        <p className="font-mono text-xs text-slate-500">{line.sku}</p>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono tabular text-slate-600">
                        {ord}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono tabular text-slate-600">
                        {rec}
                      </td>
                      <td className="px-3 py-2.5">
                        <Input
                          type="number"
                          min={0}
                          max={remaining}
                          aria-label={`Quantity received for ${name}`}
                          value={receipts[pId] ?? 0}
                          onChange={(e) => {
                            const qty = Math.min(Math.max(Number(e.target.value) || 0, 0), remaining);
                            setReceipts((prev) => ({ ...prev, [pId]: qty }));
                            setError('');
                          }}
                          className="ml-auto w-24 text-right font-mono tabular"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-3 py-2.5">
              <span className="text-sm text-slate-600">{units} units this delivery</span>
              <span className="font-mono text-sm font-semibold tabular text-slate-900">
                {formatCurrency(value)}
              </span>
            </div>
          </div>
        )}

        <Field label="Delivery note" error={error} hint="Recorded against every stock movement.">
          <Textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Two cases short on cheese, driver signed the discrepancy slip."
          />
        </Field>
      </div>
    </Modal>
  );
}