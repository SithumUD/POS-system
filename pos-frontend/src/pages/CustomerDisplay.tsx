import React, { useEffect, useState } from 'react';
import { formatCurrency } from '../utils/currency';
import { ShoppingCartIcon, CheckCircle2Icon } from 'lucide-react';

interface CartLine {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface Totals {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  itemCount: number;
}

export function CustomerDisplay() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [totals, setTotals] = useState<Totals>({
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    itemCount: 0,
  });
  const [completed, setCompleted] = useState<{ change: number; total: number } | null>(null);

  useEffect(() => {
    const channel = new BroadcastChannel('pos-cfd');

    channel.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'CART_UPDATE') {
        setCart(payload.cart);
        setTotals(payload.totals);
        setCompleted(null);
      } else if (type === 'SALE_COMPLETE') {
        setCompleted({ change: payload.change, total: payload.total });
      } else if (type === 'NEW_SALE') {
        setCart([]);
        setTotals({ subtotal: 0, discount: 0, tax: 0, total: 0, itemCount: 0 });
        setCompleted(null);
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-900 text-white selection:bg-brand-500/30">
      {/* Left Promo Area */}
      <div className="relative flex w-[60%] flex-col overflow-hidden bg-black shadow-2xl">
        {/* Promotional Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-70 transition-transform duration-1000 ease-in-out hover:scale-105"
          style={{ backgroundImage: `url('file:///C:/Users/sithu/.gemini/antigravity-ide/brain/568a95c0-0a1a-427e-91ad-c24e6c193575/supermarket_promo_1786098592327.png')` }}
        />
        
        {/* Glassmorphism Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
        
        <div className="relative z-10 mt-auto p-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/20 px-4 py-1.5 text-brand-300 backdrop-blur-md">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-500" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider">Antigravity POS</span>
          </div>
          <h1 className="mt-6 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Welcome to <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-emerald-400">Retail Excellence</span>
          </h1>
          <p className="mt-4 max-w-lg text-lg text-slate-300">
            Enjoy premium quality products hand-selected just for you. Sign up for our loyalty program today to earn points on this purchase!
          </p>
        </div>
      </div>

      {/* Right Cart Area */}
      <div className="flex w-[40%] flex-col bg-slate-800 shadow-[-20px_0_40px_-15px_rgba(0,0,0,0.5)]">
        {completed ? (
          <div className="flex h-full flex-col items-center justify-center p-12 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <CheckCircle2Icon className="h-12 w-12" />
            </div>
            <h2 className="mt-8 text-3xl font-bold text-white">Thank You!</h2>
            <p className="mt-3 text-lg text-slate-400">Your transaction is complete.</p>
            
            <div className="mt-10 w-full rounded-2xl border border-slate-700 bg-slate-900/50 p-6 backdrop-blur-lg">
              <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                <span className="text-lg text-slate-400">Total Paid</span>
                <span className="font-mono text-2xl font-semibold">{formatCurrency(completed.total)}</span>
              </div>
              <div className="flex items-center justify-between pt-4">
                <span className="text-lg text-emerald-400">Change Due</span>
                <span className="font-mono text-4xl font-bold text-emerald-400">
                  {formatCurrency(completed.change)}
                </span>
              </div>
            </div>
          </div>
        ) : cart.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-12 text-center opacity-50 transition-opacity">
            <ShoppingCartIcon className="h-16 w-16 text-slate-500" />
            <h2 className="mt-6 text-2xl font-medium text-slate-300">Ready for next customer</h2>
            <p className="mt-2 text-slate-500">Please wait for the cashier to scan your items.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-8 py-6 thin-scroll">
              <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-slate-500">
                Your Cart ({totals.itemCount} items)
              </h3>
              <ul className="space-y-4">
                {cart.map((item, idx) => (
                  <li key={item.productId + idx} className="group flex items-center justify-between rounded-xl bg-slate-700/30 p-4 transition-colors hover:bg-slate-700/50">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-medium text-slate-200">{item.name}</p>
                      <p className="font-mono text-sm text-slate-400">
                        {item.quantity} × {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <span className="font-mono text-lg font-bold text-white">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="shrink-0 bg-slate-900/80 p-8 backdrop-blur-xl border-t border-slate-700">
              <div className="space-y-3 text-lg">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatCurrency(totals.subtotal)}</span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span className="font-mono">−{formatCurrency(totals.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Tax</span>
                  <span className="font-mono">{formatCurrency(totals.tax)}</span>
                </div>
                <div className="mt-4 flex justify-between border-t border-slate-700 pt-6 text-4xl font-bold text-white">
                  <span>Total</span>
                  <span className="font-mono tabular-nums tracking-tight">{formatCurrency(totals.total)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
