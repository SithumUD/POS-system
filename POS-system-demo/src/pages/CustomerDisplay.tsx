import React, { useEffect, useState } from 'react';
import { formatCurrency } from '../utils/currency';
import { ShoppingCartIcon, CheckCircle2Icon, SparklesIcon } from 'lucide-react';

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

// Animated ticker messages shown in the idle promo panel
const PROMO_MESSAGES = [
  'Scan your loyalty card to earn points on every purchase!',
  'Ask about our weekly specials — new deals every Monday.',
  'Download our app for exclusive member-only discounts.',
  'Returns accepted within 30 days with receipt.',
  'Thank you for shopping with us today!',
];

export function CustomerDisplay() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [totals, setTotals] = useState<Totals>({
    subtotal: 0, discount: 0, tax: 0, total: 0, itemCount: 0,
  });
  const [completed, setCompleted] = useState<{ change: number; total: number } | null>(null);
  const [promoIdx, setPromoIdx] = useState(0);
  const [promoVisible, setPromoVisible] = useState(true);
  const [clock, setClock] = useState(new Date());

  // BroadcastChannel for POS → display communication
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
    return () => channel.close();
  }, []);

  // Cycle promo messages with fade
  useEffect(() => {
    const interval = setInterval(() => {
      setPromoVisible(false);
      setTimeout(() => {
        setPromoIdx((i) => (i + 1) % PROMO_MESSAGES.length);
        setPromoVisible(true);
      }, 600);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeStr = clock.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = clock.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0e1a] text-white select-none">

      {/* ── LEFT: Promotional panel ─────────────────────────────── */}
      <div className="relative flex w-[58%] flex-col overflow-hidden">

        {/* Background image with gradient overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage: `url('C:\\Users\\sithu\\.gemini\\antigravity-ide\\brain\\e0652cb6-1e27-4ccb-893e-b95f4cd503ad\\customer_display_bg_1786179565564.png')`,
            filter: 'brightness(0.55)',
          }}
        />

        {/* Layered gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0e1a] via-transparent to-transparent opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-indigo-900/20" />

        {/* TOP: Date & Time */}
        <div className="relative z-10 flex items-start justify-between p-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300/70">{dateStr}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-5xl font-thin tracking-tight text-white/90">{timeStr}</p>
          </div>
        </div>

        {/* CENTER: Main brand area */}
        <div className="relative z-10 flex flex-1 flex-col items-start justify-center px-12 pb-4">

          {/* Store identity badge — no "Antigravity" branding */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-5 py-2 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">
              NexPOS · Checkout Terminal
            </span>
          </div>

          <h1 className="mt-8 text-[4.5rem] font-extrabold leading-none tracking-tight text-white lg:text-[5.5rem]">
            Welcome to<br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 40%, #34d399 100%)',
              }}
            >
              Your Store
            </span>
          </h1>

          <p className="mt-6 max-w-md text-xl font-light leading-relaxed text-white/50">
            Quality products, exceptional service. Every visit, every time.
          </p>
        </div>

        {/* BOTTOM: Scrolling promo ticker */}
        <div className="relative z-10 m-8 mt-0">
          <div className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/5 px-6 py-4 backdrop-blur-xl">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
              <SparklesIcon className="h-4 w-4" />
            </div>
            <p
              className="text-sm font-medium text-white/70 transition-opacity duration-500"
              style={{ opacity: promoVisible ? 1 : 0 }}
            >
              {PROMO_MESSAGES[promoIdx]}
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Cart / transaction panel ─────────────────────── */}
      <div
        className="flex w-[42%] flex-col"
        style={{
          background: 'linear-gradient(180deg, #0f1629 0%, #111827 100%)',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '-30px 0 60px -15px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header bar */}
        <div className="shrink-0 border-b border-white/5 px-8 py-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Your Order</p>
        </div>

        {/* ── STATE: Sale completed ── */}
        {completed ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-0 p-10 text-center">
            <div
              className="flex h-28 w-28 items-center justify-center rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.2) 0%, transparent 70%)' }}
            >
              <CheckCircle2Icon className="h-14 w-14 text-emerald-400" strokeWidth={1.5} />
            </div>

            <h2 className="mt-8 text-4xl font-bold text-white">Thank You!</h2>
            <p className="mt-2 text-base text-slate-500">Your transaction is complete.</p>

            <div className="mt-10 w-full overflow-hidden rounded-2xl border border-white/5 bg-white/3">
              <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
                <span className="text-sm text-slate-400">Total Paid</span>
                <span className="font-mono text-2xl font-semibold text-white">
                  {formatCurrency(completed.total)}
                </span>
              </div>
              <div
                className="flex items-center justify-between px-6 py-6"
                style={{ background: 'linear-gradient(90deg, rgba(52,211,153,0.08) 0%, transparent 100%)' }}
              >
                <span className="text-base font-semibold text-emerald-400">Change Due</span>
                <span className="font-mono text-5xl font-bold text-emerald-400">
                  {formatCurrency(completed.change)}
                </span>
              </div>
            </div>
          </div>

        /* ── STATE: Cart empty / idle ── */
        ) : cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 p-10 text-center">
            <div className="rounded-3xl border border-white/5 bg-white/3 p-8">
              <ShoppingCartIcon className="h-16 w-16 text-slate-600" strokeWidth={1} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-300">Ready for next customer</h2>
              <p className="mt-2 text-sm text-slate-600">Please wait for the cashier to scan your items.</p>
            </div>
          </div>

        /* ── STATE: Active cart ── */
        ) : (
          <>
            {/* Item list */}
            <div className="flex-1 overflow-y-auto px-6 py-5" style={{ scrollbarWidth: 'none' }}>
              <ul className="space-y-2.5">
                {cart.map((item, idx) => (
                  <li
                    key={item.productId + idx}
                    className="flex items-center justify-between rounded-xl px-5 py-4"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-medium text-slate-200">{item.name}</p>
                      <p className="mt-0.5 font-mono text-sm text-slate-500">
                        {item.quantity} × {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <span className="ml-4 shrink-0 font-mono text-lg font-bold text-white">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Totals footer */}
            <div
              className="shrink-0 px-8 py-6"
              style={{
                borderTop: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(0,0,0,0.3)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatCurrency(totals.subtotal)}</span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-500">
                    <span>Discount</span>
                    <span className="font-mono">−{formatCurrency(totals.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Tax</span>
                  <span className="font-mono">{formatCurrency(totals.tax)}</span>
                </div>
              </div>

              <div
                className="mt-5 flex items-baseline justify-between rounded-2xl px-5 py-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(129,140,248,0.12) 0%, rgba(167,139,250,0.08) 100%)',
                  border: '1px solid rgba(129,140,248,0.15)',
                }}
              >
                <span className="text-base font-semibold text-slate-300">Total</span>
                <span className="font-mono text-5xl font-extrabold tracking-tight text-white">
                  {formatCurrency(totals.total)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
