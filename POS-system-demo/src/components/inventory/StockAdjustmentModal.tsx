import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { InfoIcon, ArrowRightIcon } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Field, Input, Select, Textarea } from '../ui/Field';
import { useStore } from '../../contexts/StoreContext';
import { BranchId } from '../../types';

interface StockAdjustmentModalProps {
  open: boolean;
  onClose: () => void;
  productId?: string;
  branchId?: BranchId;
}

const reasons = ['Damaged', 'Theft', 'Recount', 'Other'];

export function StockAdjustmentModal({
  open,
  onClose,
  productId,
  branchId
}: StockAdjustmentModalProps) {
  const { products, adjustStock, branch: activeBranch, branches } = useStore();
  const [selected, setSelected] = useState(productId ?? products[0]?.id ?? '');
  const [branch, setBranch] = useState<BranchId>(branchId ?? activeBranch);
  const [type, setType] = useState<'Add' | 'Remove' | 'Correction'>('Remove');
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState('Damaged');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setSelected(productId ?? products[0]?.id ?? '');
      setBranch(branchId ?? activeBranch);
      setType('Remove');
      setQuantity('1');
      setReason('Damaged');
      setNote('');
      setError('');
    }
  }, [open, productId, branchId, activeBranch, products]);

  const product = products.find((p) => p.id === selected);
  const current = product && product.stock ? (product.stock[branch] ?? 0) : 0;
  const qty = Number(quantity) || 0;
  const resulting =
    type === 'Add' ? current + qty : type === 'Remove' ? Math.max(current - qty, 0) : qty;

  const targetBranchObj = branches.find((b) => b.id === branch || b.slug === branch);
  const targetBranchLabel = targetBranchObj
    ? targetBranchObj.shortName || (targetBranchObj as any).short || targetBranchObj.name
    : 'Branch';

  function handleConfirm() {
    if (!product) return;
    if (qty <= 0) {
      setError('Enter a quantity greater than zero.');
      return;
    }
    if (type === 'Remove' && qty > current) {
      setError(`Only ${current} units on hand at ${targetBranchLabel}.`);
      return;
    }
    adjustStock({ productId: product.id, branchId: branch, type, quantity: qty, reason, note });
    toast.success('Stock adjusted', {
      description: `${product.name} · ${current} → ${resulting} at ${targetBranchLabel}`
    });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Stock Adjustment"
      subtitle="Correct on-hand quantity for a single product and branch."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            Confirm adjustment
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Product">
          <Select value={selected} onChange={(e) => setSelected(e.target.value)}>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.sku}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Branch">
            <Select value={branch} onChange={(e) => setBranch(e.target.value as BranchId)}>
              {branches.map((b) => (
                <option key={b.id} value={b.slug || b.id}>
                  {b.shortName || (b as any).short || b.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Adjustment Type">
            <Select
              value={type}
              onChange={(e) => setType(e.target.value as 'Add' | 'Remove' | 'Correction')}>
              
              <option value="Add">Add</option>
              <option value="Remove">Remove</option>
              <option value="Correction">Correction (set to)</option>
            </Select>
          </Field>
          <Field
            label={type === 'Correction' ? 'Counted quantity' : 'Quantity'}
            hint={`Current on hand: ${current} units`}
            error={error}>
            
            <Input
              type="number"
              min={0}
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setError('');
              }}
              className="font-mono tabular" />
            
          </Field>
          <Field label="Reason">
            <Select value={reason} onChange={(e) => setReason(e.target.value)}>
              {reasons.map((r) =>
              <option key={r}>{r}</option>
              )}
            </Select>
          </Field>
        </div>

        <Field label="Notes">
          <Textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Two cartons leaked in the chiller during the morning delivery." />
          
        </Field>

        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 ring-1 ring-inset ring-slate-100">
          <span className="text-sm text-slate-600">Resulting stock on hand</span>
          <span className="inline-flex items-center gap-2 font-mono text-sm tabular">
            <span className="text-slate-400">{current}</span>
            <ArrowRightIcon className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <span
              className={`text-lg font-bold ${
              resulting === 0 ?
              'text-red-600' :
              product && resulting <= (product.reorderThreshold ?? product.threshold ?? 0) ?
              'text-amber-600' :
              'text-slate-900'}`
              }>
              
              {resulting}
            </span>
          </span>
        </div>

        <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-800 ring-1 ring-inset ring-amber-200">
          <InfoIcon className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          This adjustment will be recorded in the stock movement ledger and cannot be edited
          afterward.
        </p>
      </div>
    </Modal>);

}