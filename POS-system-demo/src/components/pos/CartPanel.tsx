import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  MinusIcon,
  PlusIcon,
  XIcon,
  PauseIcon,
  TagIcon,
  BanknoteIcon,
  CreditCardIcon,
  SplitIcon,
  ShoppingCartIcon,
  AlertTriangleIcon
} from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { formatCurrency } from '../../utils/currency';
import { PaymentMethod } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { DiscountModal } from './DiscountModal';
import { PaymentModal } from './PaymentModal';
import { HeldSalesModal } from './HeldSalesModal';

const paymentOptions: { key: PaymentMethod; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'CASH', label: 'Cash', icon: BanknoteIcon },
  { key: 'CARD', label: 'Card', icon: CreditCardIcon },
  { key: 'SPLIT', label: 'Split', icon: SplitIcon }
];

export function CartPanel() {
  const {
    cart,
    totals,
    lastSale,
    discount,
    payment,
    held,
    setLineQty,
    removeLine,
    setDiscount,
    setPayment,
    holdSale,
    resumeHeld,
    discardHeld,
    clearCart,
    completeSale,
    availableStock
  } = useStore();

  const [discountOpen, setDiscountOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [heldOpen, setHeldOpen] = useState(false);
  const [voidOpen, setVoidOpen] = useState(false);

  const empty = cart.length === 0;

  useEffect(() => {
    const channel = new BroadcastChannel('pos-cfd');
    if (cart.length > 0) {
      channel.postMessage({ type: 'CART_UPDATE', payload: { cart, totals } });
    } else if (!lastSale) {
      channel.postMessage({ type: 'NEW_SALE' });
    }
    return () => channel.close();
  }, [cart, totals, lastSale]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'F1') {
        e.preventDefault();
        setPayment('CASH');
      } else if (e.key === 'F2') {
        e.preventDefault();
        setPayment('CARD');
      } else if (e.key === 'F4') {
        e.preventDefault();
        setPayment('SPLIT');
      } else if (e.key === 'F12') {
        e.preventDefault();
        if (!empty) setVoidOpen(true);
      }
      
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      const hasModalOpen = paymentOpen || discountOpen || voidOpen || heldOpen;
      
      if (e.key === 'Enter' && !isInput && !hasModalOpen && !empty) {
        e.preventDefault();
        setPaymentOpen(true);
      }
    }
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setPayment, empty, paymentOpen, discountOpen, voidOpen, heldOpen]);

  const activeMethodKey = payment === ('Cash' as any) ? 'CASH' : payment === ('Card' as any) ? 'CARD' : payment === ('Split' as any) ? 'SPLIT' : payment;

  function handleHold() {
    if (empty) {
      toast.error('Nothing to hold — the basket is empty.');
      return;
    }
    holdSale();
    toast.success('Sale held', { description: 'Recall it any time from the held-sales list.' });
  }

  return (
    <aside
      aria-label="Current sale"
      className="flex h-full w-full flex-col border-l border-slate-200 bg-white"
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-slate-900">Current Sale</h2>
          <button
            onClick={() => setHeldOpen(true)}
            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset transition-colors ${
              held.length > 0
                ? 'bg-brand-50 text-brand-700 ring-brand-200 hover:bg-brand-100'
                : 'bg-slate-100 text-slate-500 ring-slate-200 hover:bg-slate-200'
            }`}
          >
            {held.length} held
          </button>
        </div>
        <button
          onClick={handleHold}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          <PauseIcon className="h-3.5 w-3.5" aria-hidden="true" />
          Hold Sale
        </button>
      </div>

      <ul className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto thin-scroll">
        {cart.map((line) => {
          const max = availableStock(line.productId);
          const atMax = line.quantity >= max;
          return (
            <li key={line.productId} className="px-5 py-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{line.name}</p>
                  <p className="mt-0.5 font-mono text-xs tabular text-slate-500">
                    {formatCurrency(line.unitPrice)} each · {max} in stock
                  </p>
                </div>
                <button
                  onClick={() => removeLine(line.productId)}
                  aria-label={`Remove ${line.name}`}
                  className="rounded-md p-1 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2.5 flex items-center justify-between">
                <div className="inline-flex items-center rounded-lg border border-slate-200">
                  <button
                    onClick={() => setLineQty(line.productId, line.quantity - 1)}
                    aria-label={`Decrease quantity of ${line.name}`}
                    className="flex h-9 w-9 items-center justify-center rounded-l-lg text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <input
                    value={line.quantity}
                    onChange={(e) => setLineQty(line.productId, Number(e.target.value) || 0)}
                    aria-label={`Quantity of ${line.name}`}
                    className="w-10 border-0 bg-transparent p-0 text-center font-mono text-sm font-semibold tabular text-slate-900 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      if (atMax) {
                        toast.error(`Only ${max} in stock at this branch.`);
                        return;
                      }
                      setLineQty(line.productId, line.quantity + 1);
                    }}
                    aria-label={`Increase quantity of ${line.name}`}
                    className={`flex h-9 w-9 items-center justify-center rounded-r-lg transition-colors ${
                      atMax ? 'text-slate-300' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
                <span className="font-mono text-sm font-semibold tabular text-slate-900">
                  {formatCurrency(line.unitPrice * line.quantity)}
                </span>
              </div>
            </li>
          );
        })}
        {empty && (
          <li className="px-5 py-16 text-center">
            <ShoppingCartIcon className="mx-auto h-7 w-7 text-slate-300" aria-hidden="true" />
            <p className="mt-2 text-sm text-slate-400">Scan an item to start a sale.</p>
          </li>
        )}
      </ul>

      <div className="shrink-0 border-t border-slate-200 px-5 py-4">
        <button
          onClick={() => setDiscountOpen(true)}
          disabled={empty}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 disabled:text-slate-300"
        >
          <TagIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {discount > 0 ? 'Edit discount' : 'Add discount'}
        </button>

        <dl className="mt-3 space-y-1.5 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-slate-500">Subtotal</dt>
            <dd className="font-mono tabular text-slate-700">{formatCurrency(totals.subtotal)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-slate-500">Discount</dt>
            <dd className="font-mono tabular text-emerald-600">
              −{formatCurrency(totals.discount)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-slate-500">Tax (10%)</dt>
            <dd className="font-mono tabular text-slate-700">{formatCurrency(totals.tax)}</dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-slate-200 pt-2.5">
            <dt className="text-base font-semibold text-slate-900">Total</dt>
            <dd className="font-mono text-2xl font-bold tabular tracking-tight text-slate-900">
              {formatCurrency(totals.total)}
            </dd>
          </div>
        </dl>

        <div className="mt-4 grid grid-cols-3 gap-2" role="group" aria-label="Payment method">
          {paymentOptions.map((option) => {
            const active = option.key === activeMethodKey;
            return (
              <button
                key={option.key}
                aria-pressed={active}
                onClick={() => setPayment(option.key)}
                className={`flex h-14 flex-col items-center justify-center gap-1 rounded-lg border text-sm font-medium transition-colors relative ${
                  active
                    ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="absolute top-1 left-1.5 text-[9px] font-mono font-bold opacity-50">
                  {option.key === 'CASH' ? 'F1' : option.key === 'CARD' ? 'F2' : 'F4'}
                </div>
                <option.icon className="h-4 w-4" aria-hidden="true" />
                {option.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setPaymentOpen(true)}
          disabled={empty}
          className="mt-4 flex h-16 w-full items-center justify-center rounded-xl bg-brand-500 font-mono text-lg font-bold tabular text-white transition-colors hover:bg-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          Charge {formatCurrency(totals.total)}
        </button>

        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={() => (empty ? toast.error('There is no sale to void.') : setVoidOpen(true))}
            className="rounded-md px-2 py-1 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 flex items-center gap-2"
          >
            Void Sale <span className="rounded bg-red-100 px-1 font-mono text-[10px] text-red-500">F12</span>
          </button>
          <button
            onClick={handleHold}
            className="rounded-md px-2 py-1 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
          >
            Park &amp; New Sale
          </button>
        </div>
      </div>

      <DiscountModal
        open={discountOpen}
        onClose={() => setDiscountOpen(false)}
        subtotal={totals.subtotal}
        current={discount}
        onApply={(amount) => {
          setDiscount(amount);
          toast.success(
            amount > 0 ? `Discount of ${formatCurrency(amount)} applied` : 'Discount removed'
          );
        }}
      />

      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        total={totals.total}
        method={payment}
        onMethodChange={setPayment}
        onConfirm={(tendered) => {
          const change = tendered - totals.total;
          const finalTotal = totals.total;
          completeSale(tendered);
          setPaymentOpen(false);
          
          const channel = new BroadcastChannel('pos-cfd');
          channel.postMessage({ type: 'SALE_COMPLETE', payload: { change: change > 0 ? change : 0, total: finalTotal } });
          channel.close();
        }}
      />

      <HeldSalesModal
        open={heldOpen}
        onClose={() => setHeldOpen(false)}
        held={held}
        onResume={resumeHeld}
        onDiscard={discardHeld}
        cartHasItems={!empty}
      />

      <Modal
        open={voidOpen}
        onClose={() => setVoidOpen(false)}
        title="Void this sale?"
        width="max-w-md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setVoidOpen(false)}>
              Keep sale
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                clearCart();
                setVoidOpen(false);
                toast.success('Sale voided', {
                  description: 'The void was logged against this shift.'
                });
              }}
            >
              Void sale
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <AlertTriangleIcon className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="text-sm leading-relaxed text-slate-600">
            {totals.itemCount} item{totals.itemCount === 1 ? '' : 's'} worth{' '}
            <span className="font-mono tabular font-medium text-slate-900">
              {formatCurrency(totals.total)}
            </span>{' '}
            will be cleared. Voids are recorded against your shift and reviewed by your manager.
          </p>
        </div>
      </Modal>
    </aside>
  );
}