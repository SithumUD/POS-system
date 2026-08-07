import React, { useEffect, useState } from 'react';
import { BanknoteIcon, CreditCardIcon, SplitIcon, Loader2Icon, CheckIcon } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { PaymentMethod } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  total: number;
  method: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  onConfirm: (tendered: number) => void;
}

const methods: { key: PaymentMethod; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'CASH', label: 'Cash', icon: BanknoteIcon },
  { key: 'CARD', label: 'Card', icon: CreditCardIcon },
  { key: 'SPLIT', label: 'Split', icon: SplitIcon }
];

function roundUpTo(value: number, step: number): number {
  return Math.ceil(value / step) * step;
}

export function PaymentModal({
  open,
  onClose,
  total,
  method,
  onMethodChange,
  onConfirm
}: PaymentModalProps) {
  const [tendered, setTendered] = useState('');
  const [cashPortion, setCashPortion] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (open) {
      setTendered('');
      setCashPortion(String(Math.round(total / 2)));
      setProcessing(false);
    }
  }, [open, total]);

  const activeMethodKey = method === ('Cash' as any) ? 'CASH' : method === ('Card' as any) ? 'CARD' : method === ('Split' as any) ? 'SPLIT' : method;

  const tenderedValue = Number(tendered) || 0;
  const change = Math.max(tenderedValue - total, 0);
  const cashValue = Math.min(Number(cashPortion) || 0, total);
  const cardValue = Math.round((total - cashValue) * 100) / 100;

  const canConfirm =
    activeMethodKey === 'CASH' ? tenderedValue >= total : activeMethodKey === 'SPLIT' ? cashValue > 0 : true;

  function handleConfirm() {
    setProcessing(true);
    window.setTimeout(() => {
      onConfirm(activeMethodKey === 'CASH' ? tenderedValue : total);
      setProcessing(false);
    }, 900);
  }

  const quickAmounts = [total, roundUpTo(total, 500), roundUpTo(total, 1000), roundUpTo(total, 5000)]
    .filter((value, index, arr) => arr.indexOf(value) === index)
    .slice(0, 4);

  return (
    <Modal
      open={open}
      onClose={processing ? () => undefined : onClose}
      title="Take payment"
      subtitle={`Amount due ${formatCurrency(total)}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={processing}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={handleConfirm}
            disabled={!canConfirm || processing}
          >
            {processing ? (
              <>
                <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden="true" />
                {activeMethodKey === 'CARD' ? 'Authorising card…' : 'Completing sale…'}
              </>
            ) : (
              <>
                <CheckIcon className="h-4 w-4" aria-hidden="true" />
                Confirm {activeMethodKey.toLowerCase()} payment
              </>
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="rounded-card bg-slate-900 px-5 py-4 text-white">
          <p className="text-xs uppercase tracking-wide text-slate-400">Amount due</p>
          <p className="mt-1 font-mono text-3xl font-bold tabular tracking-tight">
            {formatCurrency(total)}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2" role="group" aria-label="Payment method">
          {methods.map((option) => {
            const active = option.key === activeMethodKey;
            return (
              <button
                key={option.key}
                aria-pressed={active}
                disabled={processing}
                onClick={() => onMethodChange(option.key)}
                className={`flex h-14 flex-col items-center justify-center gap-1 rounded-lg border text-sm font-medium transition-colors ${
                  active
                    ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <option.icon className="h-4 w-4" aria-hidden="true" />
                {option.label}
              </button>
            );
          })}
        </div>

        {activeMethodKey === 'CASH' && (
          <div className="space-y-3">
            <div>
              <label htmlFor="tendered" className="mb-1.5 block text-xs font-medium text-slate-700">
                Cash tendered
              </label>
              <input
                id="tendered"
                type="number"
                min={0}
                autoFocus
                value={tendered}
                onChange={(e) => setTendered(e.target.value)}
                placeholder="0.00"
                className="h-14 w-full rounded-lg border border-slate-200 px-4 text-right font-mono text-2xl font-semibold tabular text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setTendered(String(amount))}
                  className="rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs tabular text-slate-700 transition-colors hover:border-brand-300 hover:text-brand-700"
                >
                  {formatCurrency(amount)}
                </button>
              ))}
            </div>
            <div
              className={`flex items-center justify-between rounded-lg px-4 py-3 ring-1 ring-inset ${
                tenderedValue >= total
                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                  : 'bg-slate-50 text-slate-500 ring-slate-100'
              }`}
            >
              <span className="text-sm font-medium">Change due</span>
              <span className="font-mono text-xl font-bold tabular">{formatCurrency(change)}</span>
            </div>
            {tenderedValue > 0 && tenderedValue < total && (
              <p className="text-xs font-medium text-red-600">
                Short by {formatCurrency(total - tenderedValue)}.
              </p>
            )}
          </div>
        )}

        {activeMethodKey === 'CARD' && (
          <div className="rounded-card border border-dashed border-slate-300 px-5 py-6 text-center">
            <CreditCardIcon className="mx-auto h-7 w-7 text-slate-400" aria-hidden="true" />
            <p className="mt-2 text-sm font-medium text-slate-700">
              Waiting for card on the terminal
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Tap, insert, or swipe — the full {formatCurrency(total)} will be charged.
            </p>
          </div>
        )}

        {activeMethodKey === 'SPLIT' && (
          <div className="space-y-3">
            <div>
              <label htmlFor="cash-portion" className="mb-1.5 block text-xs font-medium text-slate-700">
                Cash portion
              </label>
              <input
                id="cash-portion"
                type="number"
                min={0}
                max={total}
                value={cashPortion}
                onChange={(e) => setCashPortion(e.target.value)}
                className="h-12 w-full rounded-lg border border-slate-200 px-4 text-right font-mono text-lg font-semibold tabular text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 ring-1 ring-inset ring-slate-100">
              <span className="text-sm text-slate-600">Remaining on card</span>
              <span className="font-mono text-lg font-semibold tabular text-slate-900">
                {formatCurrency(cardValue)}
              </span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}