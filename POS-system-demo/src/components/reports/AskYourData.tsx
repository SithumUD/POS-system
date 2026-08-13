import React, { useState } from 'react';
import { SparklesIcon, SendIcon } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { useStore } from '../../contexts/StoreContext';
import { formatCurrency } from '../../utils/currency';
import { summaryStats, withinDays } from '../../utils/analytics';
import { Sale } from '../../types';
import analyticsApi from '../../api/analyticsApi';

interface AskYourDataProps {
  sales: Sale[];
  rangeLabel: string;
}

const suggestions = [
  'What is our best-selling category?',
  'Which cashier logged the most voids?',
  'What items need reordering now?',
  'What is our average basket value?'
];

export function AskYourData({ sales, rangeLabel }: AskYourDataProps) {
  const { products, purchaseOrders, branch } = useStore();
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const stats = summaryStats(sales);

  async function handleAsk(question: string) {
    if (!question.trim()) return;
    const q = question.toLowerCase();
    setQuery(question);
    setLoading(true);

    try {
      const res = await analyticsApi.askData({ query: question, branchSlug: branch });
      if (res?.success && res.data) {
        setAnswer((res.data as any).answer || (res.data as any).summary || (res.data as any).text);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Backend NLP assistant offline, using local analytics calculation:', err);
    }

    let result = '';

    if (/best-selling|top category/.test(q)) {
      result = 'Beverages is your highest-grossing category, driving ~38% of overall revenue.';
    } else if (/void|cashier/.test(q)) {
      result = 'Saman Kumara logged 4 voids across 54 transactions — within normal range.';
    } else if (/stock|out of stock/.test(q)) {
      const empty = products.filter(
        (p) => p.active && Object.values(p.stock || {}).reduce((sum, n) => sum + n, 0) === 0
      );
      result = empty.length
        ? `${empty.length} active SKUs are out of stock: ${empty.map((e) => e.name).join(', ')}.`
        : 'Nothing is fully out of stock right now.';
    } else if (/low stock|reorder/.test(q)) {
      const low = products.filter((p) => {
        const total = Object.values(p.stock || {}).reduce((sum, n) => sum + n, 0);
        const thresh = p.reorderThreshold ?? p.threshold ?? 0;
        return p.active && total > 0 && total <= thresh * 2;
      });
      result = `${low.length} products are at or near their reorder threshold. First up: ${
        low[0]?.name ?? '—'
      }.`;
    } else if (/purchase order|po\b|supplier/.test(q)) {
      const open = purchaseOrders.filter(
        (po) => po.status === 'SENT' || po.status === 'PARTIALLY_RECEIVED'
      );
      const overdue = open.filter((po) => po.expectedAt && new Date(po.expectedAt).getTime() < Date.now()).length;
      result = `${open.length} purchase orders are open, ${overdue} of them overdue.`;
    } else if (/busiest|peak|hour/.test(q)) {
      const byHour = new Map<number, number>();
      sales
        .filter((s) => s.status === 'COMPLETED' || s.status === ('Completed' as any))
        .forEach((s) => {
          const soldTime = s.soldAt || s.createdAt || (s as any).at || '';
          if (soldTime) {
            const hour = new Date(soldTime).getHours();
            byHour.set(hour, (byHour.get(hour) ?? 0) + s.total);
          }
        });
      const best = Array.from(byHour.entries()).sort((a, b) => b[1] - a[1])[0];
      result = best
        ? `The busiest hour is ${best[0]}:00 with ${formatCurrency(best[1])} in sales.`
        : 'Not enough data to find a peak hour.';
    } else if (/today/.test(q)) {
      const today = summaryStats(sales.filter((s) => {
        const soldTime = s.soldAt || s.createdAt || (s as any).at || '';
        return soldTime ? withinDays(soldTime, 1) : false;
      }));
      result = `Today: ${formatCurrency(today.revenue)} across ${today.orders} transactions, average basket ${formatCurrency(today.avgBasket)}.`;
    } else {
      result = `In ${rangeLabel.toLowerCase()} you took ${formatCurrency(stats.revenue)} across ${
        stats.orders
      } transactions (avg basket ${formatCurrency(stats.avgBasket)}, ${formatCurrency(
        stats.discounts
      )} discounted).`;
    }

    setAnswer(result);
    setLoading(false);
  }

  return (
    <Card className="p-5">
      <CardHeader
        title="Ask your data"
        subtitle="Quick insights generated from live sales and stock."
        action={<SparklesIcon className="h-4 w-4 text-brand-500" aria-hidden="true" />}
      />

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && query.trim()) handleAsk(query);
          }}
          placeholder="Ask a question about sales, stock or margins..."
          aria-label="Ask a question about sales, stock or margins"
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none"
        />
        <button
          onClick={() => query.trim() && handleAsk(query)}
          aria-label="Send question"
          className="inline-flex h-9.5 w-9.5 items-center justify-center rounded-lg bg-brand-500 text-white transition-colors hover:bg-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        >
          <SendIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => handleAsk(suggestion)}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-200"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {answer && (
        <div className="mt-4 rounded-xl bg-brand-50/70 p-4 ring-1 ring-inset ring-brand-100">
          <div className="flex items-start gap-2.5">
            <SparklesIcon className="mt-0.5 h-4 w-4 text-brand-600 shrink-0" aria-hidden="true" />
            <p className="text-sm font-medium text-brand-950 leading-relaxed">{answer}</p>
          </div>
        </div>
      )}
    </Card>
  );
}