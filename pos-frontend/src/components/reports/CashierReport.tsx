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
import { Th, Td, Tr } from '../ui/Table';
import { formatCurrency } from '../../utils/currency';
import { CashierRow } from '../../utils/analytics';

export function CashierReport({
  cashiers,
  rangeLabel



}: {cashiers: CashierRow[];rangeLabel: string;}) {
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <CardHeader title="Revenue by cashier" subtitle={rangeLabel} className="mb-4" />
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cashiers} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="cashier"
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
              
              <Bar dataKey="revenue" fill="#3B5BFF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader
          title="Team performance"
          subtitle="Voids and refunds feed anomaly monitoring" />
        
        <div className="overflow-x-auto thin-scroll">
          <table className="w-full min-w-[820px] border-collapse text-sm">
            <thead>
              <tr>
                <Th>Cashier</Th>
                <Th align="right">Orders</Th>
                <Th align="right">Revenue</Th>
                <Th align="right">Avg basket</Th>
                <Th align="right">Items</Th>
                <Th align="right">Discounts</Th>
                <Th align="right">Voids</Th>
                <Th align="right">Refunds</Th>
              </tr>
            </thead>
            <tbody>
              {cashiers.map((row, index) => (
                <Tr key={row.cashier ? `${row.cashier}-${index}` : `cashier-${index}`}>
                  <Td className="whitespace-nowrap text-slate-900">{row.cashier}</Td>
                  <Td align="right" className="font-mono tabular text-slate-600">
                    {row.orders}
                  </Td>
                  <Td align="right" className="font-mono tabular font-medium text-slate-900">
                    {formatCurrency(row.revenue)}
                  </Td>
                  <Td align="right" className="font-mono tabular text-slate-600">
                    {formatCurrency(row.avgBasket)}
                  </Td>
                  <Td align="right" className="font-mono tabular text-slate-600">
                    {row.items}
                  </Td>
                  <Td align="right" className="font-mono tabular text-slate-600">
                    {formatCurrency(row.discounts)}
                  </Td>
                  <Td align="right">
                    <span
                    className={`font-mono tabular ${
                    row.voids >= 3 ? 'font-semibold text-red-600' : 'text-slate-600'}`
                    }>
                    
                      {row.voids}
                    </span>
                  </Td>
                  <Td align="right">
                    <span
                    className={`font-mono tabular ${
                    row.refunds >= 3 ? 'font-semibold text-amber-600' : 'text-slate-600'}`
                    }>
                    
                      {row.refunds}
                    </span>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </table>
        </div>
        {cashiers.length === 0 &&
        <p className="py-14 text-center text-sm text-slate-500">No cashier activity recorded.</p>
        }
      </Card>
    </div>);

}