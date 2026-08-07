import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip } from
'recharts';
import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Th, Td, Tr } from '../ui/Table';
import { StatCard } from './StatCard';
import { formatCurrency, formatNumber } from '../../utils/currency';
import { ValuationRow } from '../../utils/analytics';

export function StockValuationReport({
  valuation,
  scopeLabel



}: {valuation: ValuationRow[];scopeLabel: string;}) {
  const totalCost = valuation.reduce((sum, row) => sum + row.cost, 0);
  const totalRetail = valuation.reduce((sum, row) => sum + row.retail, 0);
  const totalUnits = valuation.reduce((sum, row) => sum + row.units, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Cost value on hand" value={formatCurrency(totalCost)} />
        <StatCard label="Retail value on hand" value={formatCurrency(totalRetail)} />
        <StatCard
          label="Potential margin"
          value={formatCurrency(totalRetail - totalCost)}
          hint={`${
          totalRetail ? ((totalRetail - totalCost) / totalRetail * 100).toFixed(1) : '0.0'}% of retail`
          } />
        
        <StatCard label="Units in stock" value={formatNumber(totalUnits)} />
      </div>

      <Card className="p-5">
        <CardHeader title="Value by category" subtitle={scopeLabel} className="mb-4" />
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={valuation} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false} />
              
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value: number) => `${Math.round(value / 1000)}k`} />
              
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
              
              <Bar dataKey="cost" name="Cost" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="retail" name="Retail" fill="#3B5BFF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader title="Category breakdown" />
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <Th>Category</Th>
              <Th align="right">SKUs</Th>
              <Th align="right">Units</Th>
              <Th align="right">Cost value</Th>
              <Th align="right">Retail value</Th>
              <Th align="right">Margin</Th>
            </tr>
          </thead>
          <tbody>
            {valuation.map((row, index) => (
              <Tr key={row.category ? `${row.category}-${index}` : `val-${index}`}>
                <Td className="text-slate-900">{row.category}</Td>
                <Td align="right" className="font-mono tabular text-slate-600">
                  {row.skus}
                </Td>
                <Td align="right" className="font-mono tabular text-slate-600">
                  {row.units}
                </Td>
                <Td align="right" className="font-mono tabular text-slate-600">
                  {formatCurrency(row.cost)}
                </Td>
                <Td align="right" className="font-mono tabular font-medium text-slate-900">
                  {formatCurrency(row.retail)}
                </Td>
                <Td align="right">
                  <Badge tone={row.retail - row.cost > 0 ? 'green' : 'slate'}>
                    {row.retail ? ((row.retail - row.cost) / row.retail * 100).toFixed(0) : 0}%
                  </Badge>
                </Td>
              </Tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>);

}