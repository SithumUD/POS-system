import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ArrowRightIcon, Trash2Icon, TruckIcon } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Field, Input, Select, Textarea } from '../ui/Field';
import { useStore } from '../../contexts/StoreContext';
import { BranchId } from '../../types';

interface TransferStockModalProps {
  open: boolean;
  onClose: () => void;
  fromBranch?: BranchId;
}

interface DraftLine {
  productId: string;
  qty: number;
}

function bKey(b: any): string {
  return b.slug || b.id;
}

function bLabel(b: any): string {
  return b.shortName || b.name || b.slug || b.id;
}

export function TransferStockModal({ open, onClose, fromBranch }: TransferStockModalProps) {
  const { branches, products, createTransfer, stockOf, branchLabel } = useStore();
  const [from, setFrom] = useState<BranchId>(fromBranch ?? bKey(branches[0]) ?? '');
  const [to, setTo] = useState<BranchId>('');
  const [lines, setLines] = useState<DraftLine[]>([]);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    const source = fromBranch ?? bKey(branches[0]) ?? '';
    setFrom(source);
    setTo(bKey(branches.find((b) => bKey(b) !== source) || branches[0]) ?? '');
    setLines([]);
    setNote('');
    setError('');
  }, [open, fromBranch, branches]);

  const available = products.filter(
    (p) => stockOf(p.id, from) > 0 && !lines.some((l) => l.productId === p.id)
  );

  function handleCreate() {
    if (from === to) {
      setError('Choose two different branches.');
      return;
    }
    const valid = lines.filter((l) => l.qty > 0);
    if (valid.length === 0) {
      setError('Add at least one product with a quantity.');
      return;
    }
    createTransfer({ from, to, note: note.trim(), lines: valid });
    toast.success('Transfer created', {
      description: `${valid.reduce((sum, l) => sum + l.qty, 0)} units · ${branchLabel(
        from
      )} → ${branchLabel(to)}`
    });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="max-w-2xl"
      title="Transfer stock between branches"
      subtitle="Stock leaves the source branch immediately and lands when the transfer is marked received."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreate}>
            <TruckIcon className="h-4 w-4" aria-hidden="true" />
            Create transfer
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <Field label="From branch">
            <Select
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setLines([]);
              }}
            >
              {branches.map((b) => (
                <option key={b.id} value={bKey(b)}>
                  {bLabel(b)}
                </option>
              ))}
            </Select>
          </Field>
          <ArrowRightIcon className="mb-2.5 h-4 w-4 justify-self-center text-slate-400" aria-hidden="true" />
          <Field label="To branch">
            <Select value={to} onChange={(e) => setTo(e.target.value)}>
              {branches
                .filter((b) => bKey(b) !== from)
                .map((b) => (
                  <option key={b.id} value={bKey(b)}>
                    {bLabel(b)}
                  </option>
                ))}
            </Select>
          </Field>
        </div>

        <div className="rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/60 px-3 py-2.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Items
            </span>
            <Select
              value=""
              onChange={(e) => {
                if (!e.target.value) return;
                setLines((prev) => [...prev, { productId: e.target.value, qty: 1 }]);
                setError('');
              }}
              className="ml-auto min-w-[240px]"
            >
              <option value="">Add product…</option>
              {available.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({stockOf(p.id, from)} on hand)
                </option>
              ))}
            </Select>
          </div>

          {lines.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              No items yet — pick products stocked at {branchLabel(from)}.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {lines.map((line) => {
                const product = products.find((p) => p.id === line.productId);
                const max = stockOf(line.productId, from);
                return (
                  <li key={line.productId} className="flex items-center gap-3 px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{product?.name}</p>
                      <p className="font-mono text-xs text-slate-500">
                        {product?.sku} · {max} available
                      </p>
                    </div>
                    <Input
                      type="number"
                      min={1}
                      max={max}
                      aria-label={`Quantity for ${product?.name}`}
                      value={line.qty}
                      onChange={(e) => {
                        const qty = Math.min(Math.max(Number(e.target.value) || 0, 0), max);
                        setLines((prev) =>
                          prev.map((l) => (l.productId === line.productId ? { ...l, qty } : l))
                        );
                      }}
                      className="w-24 text-right font-mono tabular"
                    />

                    <button
                      onClick={() =>
                        setLines((prev) => prev.filter((l) => l.productId !== line.productId))
                      }
                      aria-label={`Remove ${product?.name ?? 'item'}`}
                      className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2Icon className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <Field label="Transfer note" error={error}>
          <Textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Covering the weekend promotion at the receiving branch."
          />
        </Field>
      </div>
    </Modal>
  );
}