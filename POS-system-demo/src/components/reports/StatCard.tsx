import React from 'react';
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react';
import { Card } from '../ui/Card';

interface StatCardProps {
  label: string;
  value: string;
  delta?: number;
  hint?: string;
}

export function StatCard({ label, value, delta, hint }: StatCardProps) {
  return (
    <Card className="p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-xl font-semibold tabular text-slate-900">{value}</p>
      {typeof delta === 'number' ?
      <p
        className={`mt-1 inline-flex items-center gap-1 text-xs font-medium ${
        delta >= 0 ? 'text-emerald-600' : 'text-red-600'}`
        }>
        
          {delta >= 0 ?
        <TrendingUpIcon className="h-3 w-3" aria-hidden="true" /> :

        <TrendingDownIcon className="h-3 w-3" aria-hidden="true" />
        }
          {Math.abs(delta).toFixed(1)}% vs previous period
        </p> :

      hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>
      }
    </Card>);

}