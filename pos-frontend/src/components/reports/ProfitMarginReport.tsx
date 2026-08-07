import React from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Th, Td, Tr } from '../ui/Table';
import { StatCard } from './StatCard';
import { formatCurrency } from '../../utils/currency';
import { MarginRow } from '../../utils/analytics';

export function ProfitMarginReport({
  margins,
  rangeLabel



}: {margins: MarginRow[];rangeLabel: string;}) {
  const revenue = margins.reduce((sum, row) => sum + row.revenue, 0);
  const cost = margins.reduce((sum, row) => sum + row.cost, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Goods revenue" value={formatCurrency(revenue)} />
        <StatCard label="Cost of goods" value={formatCurrency(cost)} />
        <StatCard label="Gross profit" value={formatCurrency(revenue - cost)} />
        <StatCard
          label="Blended margin"
          value={`${revenue ? ((revenue - cost) / revenue * 100).toFixed(1) : '0.0'}%`}
          hint={rangeLabel} />
        
      </div>

      <Card className="overflow-hidden">
        <CardHeader title="Margin by product" subtitle={`Top contributors · ${rangeLabel}`} />
        <div className="overflow-x-auto thin-scroll">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr>
                <Th>Product</Th>
                <Th align="right">Units</Th>
                <Th align="right">Revenue</Th>
                <Th align="right">Cost</Th>
                <Th align="right">Profit</Th>
                <Th>Margin</Th>
              </tr>
            </thead>
            <tbody>
              {margins.map((row, index) => (
                <Tr key={row.sku ? `${row.sku}-${index}` : `margin-${index}`}>
                  <Td>
                    <p className="text-slate-900">{row.name}</p>
                    <p className="font-mono text-xs text-slate-500">{row.sku}</p>
                  </Td>
                  <Td align="right" className="font-mono tabular text-slate-600">
                    {row.units}
                  </Td>
                  <Td align="right" className="font-mono tabular text-slate-600">
                    {formatCurrency(row.revenue)}
                  </Td>
                  <Td align="right" className="font-mono tabular text-slate-600">
                    {formatCurrency(row.cost)}
                  </Td>
                  <Td align="right" className="font-mono tabular font-medium text-slate-900">
                    {formatCurrency(row.profit)}
                  </Td>
                  <Td>
                    <div className="flex w-32 items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                        className={`h-full rounded-full ${
                        row.margin >= 30 ?
                        'bg-emerald-500' :
                        row.margin >= 15 ?
                        'bg-amber-500' :
                        'bg-red-500'}`
                        }
                        style={{ width: `${Math.min(Math.max(row.margin, 0), 100)}%` }} />
                      
                      </div>
                      <span className="font-mono text-xs tabular text-slate-600">
                        {row.margin.toFixed(0)}%
                      </span>
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </table>
        </div>
        {margins.length === 0 &&
        <p className="py-14 text-center text-sm text-slate-500">
            No completed sales in this period.
          </p>
        }
      </Card>
    </div>);

}