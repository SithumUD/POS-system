import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/currency';

interface DiscountModalProps {
  open: boolean;
  onClose: () => void;
  subtotal: number;
  current: number;
  onApply: (amount: number) => void;
}

export function DiscountModal({ open, onClose, subtotal, current, onApply }: DiscountModalProps) {
  const [mode, setMode] = useState<'amount' | 'percent'>('amount');
  const [value, setValue] = useState('');

  useEffect(() => {
    if (open) {
      setMode('amount');
      setValue(current > 0 ? String(current) : '');
    }
  }, [open, current]);

  const parsed = Number(value) || 0;
  const amount =
  mode === 'percent' ?
  Math.round(subtotal * Math.min(parsed, 100)) / 100 :
  Math.min(parsed, subtotal);
  const overLimit = mode === 'percent' ? parsed > 100 : parsed > subtotal;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add discount"
      subtitle={`Applied to a subtotal of ${formatCurrency(subtotal)}`}
      footer={
      <>
          {current > 0 &&
        <Button
          variant="ghost"
          onClick={() => {
            onApply(0);
            onClose();
          }}>
          
              Remove discount
            </Button>
        }
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
          variant="primary"
          disabled={amount <= 0 || overLimit}
          onClick={() => {
            onApply(amount);
            onClose();
          }}>
          
            Apply discount
          </Button>
        </>
      }>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {(['amount', 'percent'] as const).map((option) =>
          <button
            key={option}
            onClick={() => setMode(option)}
            aria-pressed={mode === option}
            className={`h-11 rounded-lg border text-sm font-medium transition-colors ${
            mode === option ?
            'border-brand-500 bg-brand-50 text-brand-700' :
            'border-slate-200 text-slate-600 hover:bg-slate-50'}`
            }>
            
              {option === 'amount' ? 'Fixed amount (Rs.)' : 'Percentage (%)'}
            </button>
          )}
        </div>

        <div>
          <label htmlFor="discount-value" className="mb-1.5 block text-xs font-medium text-slate-700">
            {mode === 'amount' ? 'Discount amount' : 'Discount percentage'}
          </label>
          <input
            id="discount-value"
            type="number"
            min={0}
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0"
            className="h-14 w-full rounded-lg border border-slate-200 px-4 text-right font-mono text-2xl font-semibold tabular text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
          
          {overLimit &&
          <p className="mt-1.5 text-xs font-medium text-red-600">
              Discount cannot exceed the sale subtotal.
            </p>
          }
        </div>

        <div className="flex flex-wrap gap-2">
          {(mode === 'percent' ? [5, 10, 15, 20] : [100, 250, 500, 1000]).map((preset) =>
          <button
            key={preset}
            onClick={() => setValue(String(preset))}
            className="rounded-full border border-slate-200 px-3 py-1.5 font-mono text-xs tabular text-slate-600 transition-colors hover:border-brand-300 hover:text-brand-700">
            
              {mode === 'percent' ? `${preset}%` : formatCurrency(preset)}
            </button>
          )}
        </div>

        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 ring-1 ring-inset ring-slate-100">
          <span className="text-sm text-slate-600">Discount applied</span>
          <span className="font-mono text-lg font-semibold tabular text-emerald-600">
            −{formatCurrency(amount)}
          </span>
        </div>
      </div>
    </Modal>);

}