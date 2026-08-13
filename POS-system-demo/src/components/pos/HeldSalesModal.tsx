import React from 'react';
import { Trash2Icon, PlayIcon, PauseIcon } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { HeldSale } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { relativeTime } from '../../utils/time';
import { computeTotals } from '../../contexts/StoreContext';

interface HeldSalesModalProps {
  open: boolean;
  onClose: () => void;
  held: HeldSale[];
  onResume: (id: string) => void;
  onDiscard: (id: string) => void;
  cartHasItems: boolean;
}

export function HeldSalesModal({
  open,
  onClose,
  held,
  onResume,
  onDiscard,
  cartHasItems
}: HeldSalesModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Held sales"
      subtitle="Resume a parked basket or clear it out."
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      {held.length === 0 ? (
        <div className="py-10 text-center">
          <PauseIcon className="mx-auto h-6 w-6 text-slate-300" aria-hidden="true" />
          <p className="mt-2 text-sm text-slate-500">No sales are currently on hold.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {held.map((sale) => {
            const lines = sale.items || sale.lines || [];
            const totals = computeTotals((sale.lines || sale.items) as any, sale.discount);
            const heldTime = sale.heldAt || (sale as any).createdAt || '';
            const lbl = sale.label || (sale as any).notes || sale.id;

            return (
              <li
                key={sale.id}
                className="flex items-center justify-between gap-3 rounded-card border border-slate-200 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{lbl}</p>
                  <p className="font-mono text-xs tabular text-slate-500">
                    {totals.itemCount} units · {formatCurrency(totals.total)} ·{' '}
                    {relativeTime(heldTime)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      onResume(sale.id);
                      onClose();
                    }}
                  >
                    <PlayIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    Resume
                  </Button>
                  <button
                    onClick={() => onDiscard(sale.id)}
                    aria-label="Discard held sale"
                    className="rounded-md p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {cartHasItems && held.length > 0 && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-800 ring-1 ring-inset ring-amber-200">
          Resuming a held sale replaces the basket currently on screen — hold it first if you still
          need it.
        </p>
      )}
    </Modal>
  );
}