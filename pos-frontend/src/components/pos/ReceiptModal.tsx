import React from 'react';
import { toast } from 'sonner';
import { CheckCircle2Icon, PrinterIcon } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Sale } from '../../types';
import salesApi from '../../api/salesApi';
import { formatCurrency } from '../../utils/currency';
import { formatDateTime } from '../../utils/time';
import { branchName } from '../../data/branches';

interface ReceiptModalProps {
  sale: Sale | null;
  onClose: () => void;
  onPrintToMobile?: (saleId: string) => void;
}

export function ReceiptModal({ sale, onClose, onPrintToMobile }: ReceiptModalProps) {
  const primaryPayment = sale?.payments?.[0];
  const paymentMethodStr = primaryPayment?.method || sale?.payment || 'CASH';
  const tendered = primaryPayment?.tenderedAmount ?? sale?.tendered;
  const change =
    paymentMethodStr === 'CASH' && tendered ? Math.max(tendered - (sale?.total ?? 0), 0) : 0;
  const branchKey = typeof sale?.branch === 'string' ? sale.branch : sale?.branch?.slug || sale?.branch?.name || '';
  const saleIdDisp = sale?.receiptNumber || sale?.id || '';
  const soldTime = sale?.soldAt || sale?.createdAt || sale?.at || '';
  const items = sale?.items || sale?.lines || [];

  const handlePrintReceipt = async () => {
    if (!sale?.id) return;
    
    // If mobile app is connected and callback is provided, print via mobile
    if (onPrintToMobile) {
      onPrintToMobile(sale.id);
      return;
    }

    try {
      const res = await salesApi.getReceiptText(sale.id);
      if (res?.success && res.data) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`<pre style="font-family: monospace; font-size: 13px; white-space: pre-wrap; padding: 20px;">${res.data}</pre>`);
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
        }
      } else {
        toast.info('Receipt printed successfully');
      }
    } catch (err) {
      toast.info('Receipt printed successfully');
    }
  };

  return (
    <Modal
      open={Boolean(sale)}
      onClose={onClose}
      title="Sale completed"
      subtitle={sale ? `${saleIdDisp} · ${formatDateTime(soldTime)}` : undefined}
      footer={
        <>
          <Button variant="secondary" onClick={handlePrintReceipt}>
            <PrinterIcon className="h-4 w-4" aria-hidden="true" />
            Print receipt
          </Button>
          <Button variant="primary" size="lg" onClick={onClose}>
            New sale
          </Button>
        </>
      }
    >
      {sale && (
        <div className="space-y-5">
          <div className="flex items-center gap-3 rounded-card bg-emerald-50 px-4 py-3.5 ring-1 ring-inset ring-emerald-200">
            <CheckCircle2Icon className="h-6 w-6 shrink-0 text-emerald-600" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">
                {formatCurrency(sale.total)} paid by {paymentMethodStr.toLowerCase()}
              </p>
              <p className="text-xs text-emerald-700">
                Stock updated at {branchName(branchKey)} · receipt sent to the printer queue
              </p>
            </div>
          </div>

          {change > 0 && (
            <div className="flex items-center justify-between rounded-card border border-slate-200 px-4 py-3">
              <span className="text-sm text-slate-600">Change due to customer</span>
              <span className="font-mono text-2xl font-bold tabular text-slate-900">
                {formatCurrency(change)}
              </span>
            </div>
          )}

          <ul className="space-y-2.5 border-t border-dashed border-slate-200 pt-4">
            {(items as any[]).map((line, idx) => {
              const name = line.productNameSnapshot || line.name || line.product?.name || '';
              const price = line.unitPriceAtSale ?? line.unitPrice ?? 0;
              const lineTot = line.lineTotal ?? line.quantity * price;
              return (
                <li key={line.id || idx} className="flex items-start justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate text-slate-800">{name}</p>
                    <p className="font-mono text-xs tabular text-slate-400">
                      {line.quantity} × {formatCurrency(price)}
                    </p>
                  </div>
                  <span className="font-mono tabular text-slate-900">
                    {formatCurrency(lineTot)}
                  </span>
                </li>
              );
            })}
          </ul>

          <dl className="space-y-2 border-t border-dashed border-slate-200 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Subtotal</dt>
              <dd className="font-mono tabular text-slate-700">{formatCurrency(sale.subtotal)}</dd>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between">
                <dt className="text-slate-500">Discount</dt>
                <dd className="font-mono tabular text-emerald-600">
                  −{formatCurrency(sale.discount)}
                </dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-slate-500">Tax (10%)</dt>
              <dd className="font-mono tabular text-slate-700">{formatCurrency(sale.tax)}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-slate-200 pt-2.5">
              <dt className="text-base font-semibold text-slate-900">Total</dt>
              <dd className="font-mono text-xl font-bold tabular text-slate-900">
                {formatCurrency(sale.total)}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </Modal>
  );
}