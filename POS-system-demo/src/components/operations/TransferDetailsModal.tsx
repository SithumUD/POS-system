import React from 'react';
import { TruckIcon, XIcon, ArrowRightIcon } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Th, Td, Tr } from '../ui/Table';
import { formatShortDateTime } from '../../utils/time';
import { Transfer } from '../../types';

interface TransferDetailsModalProps {
  open: boolean;
  onClose: () => void;
  transfer: Transfer | null;
  branchLabel: (key: string) => string;
}

export function TransferDetailsModal({
  open,
  onClose,
  transfer,
  branchLabel
}: TransferDetailsModalProps) {
  if (!transfer) return null;

  const trfNum = transfer.transferNumber || transfer.id;
  const fromKey = transfer.fromBranchSlug || (typeof transfer.fromBranch === 'string' ? transfer.fromBranch : transfer.fromBranch?.slug) || '';
  const toKey = transfer.toBranchSlug || (typeof transfer.toBranch === 'string' ? transfer.toBranch : transfer.toBranch?.slug) || '';
  const trfItems = (transfer.items || transfer.lines || []) as any[];
  
  const statusColors = {
    IN_TRANSIT: 'blue',
    COMPLETED: 'green',
    CANCELLED: 'slate'
  } as const;

  return (
    <Modal open={open} onClose={onClose} title={`Transfer ${trfNum}`} width="max-w-2xl">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <TruckIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Transfer {trfNum}</h2>
            <p className="text-sm text-slate-500">
              Created {formatShortDateTime(transfer.createdAt || (transfer as any).at || '')}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <XIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="px-6 py-6 space-y-6">
        <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
          <div className="flex-1">
            <p className="text-xs font-medium uppercase text-slate-500">From</p>
            <p className="mt-1 font-medium text-slate-900">{branchLabel(fromKey)}</p>
          </div>
          <div className="flex shrink-0 items-center justify-center px-4">
            <ArrowRightIcon className="h-5 w-5 text-slate-300" />
          </div>
          <div className="flex-1 text-right">
            <p className="text-xs font-medium uppercase text-slate-500">To</p>
            <p className="mt-1 font-medium text-slate-900">{branchLabel(toKey)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-medium uppercase text-slate-500">Status</p>
            <div className="mt-1">
              <Badge tone={statusColors[transfer.status as keyof typeof statusColors] || 'slate'}>
                {transfer.status}
              </Badge>
            </div>
            {transfer.completedAt && (
              <p className="mt-2 text-xs text-slate-500">
                Completed: {formatShortDateTime(transfer.completedAt)}
              </p>
            )}
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-medium uppercase text-slate-500">Note</p>
            <p className="mt-1 text-sm text-slate-900">
              {transfer.note || <span className="text-slate-400 italic">No notes</span>}
            </p>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Transfer Items</h3>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <Th>Product</Th>
                  <Th>SKU</Th>
                  <Th align="right">Quantity</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trfItems.map((item, idx) => (
                  <Tr key={item.id || idx}>
                    <Td className="font-medium text-slate-900">
                      {item.productName || item.productNameSnapshot || item.name || item.product?.name || 'Unknown Item'}
                    </Td>
                    <Td className="font-mono text-xs text-slate-500">
                      {item.sku || item.productSkuSnapshot || item.product?.sku || '—'}
                    </Td>
                    <Td align="right" className="font-mono text-slate-900">
                      {item.quantity ?? item.qty ?? 0}
                    </Td>
                  </Tr>
                ))}
                <Tr className="bg-slate-50">
                  <Td colSpan={2} className="text-right font-medium text-slate-900">Total Units</Td>
                  <Td align="right" className="font-mono font-bold text-slate-900">
                    {trfItems.reduce((sum, item) => sum + (item.quantity ?? item.qty ?? 0), 0)}
                  </Td>
                </Tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
}
