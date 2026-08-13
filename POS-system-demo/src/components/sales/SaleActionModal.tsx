import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangleIcon } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Field, Select, Textarea } from '../ui/Field';
import { useStore } from '../../contexts/StoreContext';
import { Sale } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface SaleActionModalProps {
  open: boolean;
  onClose: () => void;
  sale: Sale | null;
  mode: 'refund' | 'void';
}

const refundReasons = [
  'Customer changed their mind',
  'Damaged or expired product',
  'Wrong item scanned',
  'Price dispute',
  'Other'
];

const voidReasons = [
  'Cashier entry error',
  'Payment declined',
  'Customer abandoned sale',
  'Duplicate transaction',
  'Other'
];

function getCashierName(c: any): string {
  if (!c) return '';
  if (typeof c === 'string') return c;
  return c.fullName || c.username || '';
}

export function SaleActionModal({ open, onClose, sale, mode }: SaleActionModalProps) {
  const { refundSale, voidSale } = useStore();
  const reasons = mode === 'refund' ? refundReasons : voidReasons;
  const [reason, setReason] = useState(reasons[0]);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (open) {
      setReason(reasons[0]);
      setNote('');
    }
  }, [open, mode, reasons]);

  if (!sale) return null;

  const saleIdDisp = sale.receiptNumber || sale.id;
  const items = sale.items || sale.lines || [];
  const payMethod = sale.payments?.[0]?.method || sale.payment || 'CASH';
  const cName = getCashierName(sale.cashier);

  function handleConfirm() {
    if (!sale) return;
    const detail = note.trim() ? `${reason} — ${note.trim()}` : reason;
    if (mode === 'refund') {
      refundSale(sale.id, detail);
      toast.success(`${saleIdDisp} refunded`, {
        description: `${formatCurrency(sale.total)} returned · stock restored`
      });
    } else {
      voidSale(sale.id, detail);
      toast.success(`${saleIdDisp} voided`, { description: 'Stock returned to the branch.' });
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'refund' ? `Refund ${saleIdDisp}` : `Void ${saleIdDisp}`}
      subtitle={
        mode === 'refund'
          ? 'The full sale value is returned and stock goes back on hand.'
          : 'The transaction is reversed and removed from revenue.'
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm}>
            {mode === 'refund' ? 'Confirm refund' : 'Confirm void'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 ring-1 ring-inset ring-slate-100">
          <div>
            <p className="text-sm font-medium text-slate-900">
              {items.length} item{items.length === 1 ? '' : 's'} · {cName}
            </p>
            <p className="text-xs text-slate-500">{payMethod} payment</p>
          </div>
          <span className="font-mono text-lg font-bold tabular text-slate-900">
            {formatCurrency(sale.total)}
          </span>
        </div>

        <Field label="Reason">
          <Select value={reason} onChange={(e) => setReason(e.target.value)}>
            {reasons.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </Select>
        </Field>

        <Field label="Additional detail" hint="Stored on the transaction and the stock ledger.">
          <Textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Customer returned two cartons unopened."
          />
        </Field>

        <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-800 ring-1 ring-inset ring-amber-200">
          <AlertTriangleIcon className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          This action is permanent and is included in the anomaly monitoring for this cashier.
        </p>
      </div>
    </Modal>
  );
}