import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { XIcon, PencilIcon, BuildingIcon, ArrowRightIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SlideOver } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Field, Input, Select } from '../ui/Field';
import { Th, Td, Tr } from '../ui/Table';
import { Product, MovementType, CategoryName } from '../../types';
import { categories, units } from '../../data/products';
import { useStore } from '../../contexts/StoreContext';
import { formatCurrency } from '../../utils/currency';
import { formatShortDateTime } from '../../utils/time';

const movementTones: Record<string, 'green' | 'blue' | 'amber' | 'purple' | 'red'> = {
  SALE: 'green',
  Sale: 'green',
  PURCHASE: 'blue',
  Purchase: 'blue',
  ADJUSTMENT: 'amber',
  Adjustment: 'amber',
  TRANSFER_IN: 'purple',
  TRANSFER_OUT: 'purple',
  Transfer: 'purple',
  VOID: 'red',
  Void: 'red'
};

interface ProductDetailPanelProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductDetailPanel({ product, onClose }: ProductDetailPanelProps) {
  const { saveProduct, movements, branches, categories: storeCategories, toggleActive, suppliers } = useStore();
  const activeCategories = storeCategories && storeCategories.length > 0 ? storeCategories.map((c) => c.name) : categories;
  const [draft, setDraft] = useState<Product | null>(product);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setDraft(product);
    setDirty(false);
  }, [product]);

  function update<K extends keyof Product>(key: K, value: Product[K]) {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
    setDirty(true);
  }

  const history = draft
    ? movements.filter((m) => (typeof m.product === 'object' ? m.product.id === draft.id : m.productId === draft.id)).slice(0, 8)
    : [];

  const catName = draft ? ((typeof draft.category === 'object' ? draft.category?.name : draft.category) as CategoryName || 'Beverages') : 'Beverages';
  const suppName = draft ? (typeof draft.preferredSupplier === 'object' ? draft.preferredSupplier?.name : draft.preferredSupplier) || 'Ceylon Beverages Distributors' : '';
  const price = draft ? (draft.unitPrice ?? draft.price ?? 0) : 0;
  const cost = draft ? (draft.costPrice ?? draft.cost ?? 0) : 0;
  const reorder = draft ? (draft.reorderThreshold ?? draft.threshold ?? 0) : 0;
  const unitLbl = draft ? (draft.unitLabel ?? (draft as any).unit ?? 'Bottle') : 'Bottle';

  return (
    <SlideOver open={Boolean(draft)} onClose={onClose} label="Product details" width="max-w-3xl">
      {draft && (
        <>
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
            <div className="min-w-0">
              <div className="group flex items-center gap-2">
                <input
                  value={draft.name}
                  onChange={(e) => update('name', e.target.value)}
                  aria-label="Product name"
                  className="w-full max-w-md rounded-md border border-transparent bg-transparent px-1.5 py-1 text-lg font-semibold tracking-tight text-slate-900 hover:border-slate-200 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                <PencilIcon
                  className="h-3.5 w-3.5 shrink-0 text-slate-300 group-hover:text-slate-400"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-1 px-1.5 font-mono text-xs text-slate-500">
                {draft.sku} · {draft.barcode || 'No barcode'}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <button
                onClick={() => {
                  toggleActive(draft.id);
                  update('active', !draft.active);
                }}
                role="switch"
                aria-checked={draft.active}
                className="flex items-center gap-2 text-xs font-medium text-slate-600"
              >
                <span
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    draft.active ? 'bg-brand-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`h-4 w-4 rounded-full bg-white transition-transform ${
                      draft.active ? 'translate-x-[18px]' : 'translate-x-0.5'
                    }`}
                  />
                </span>
                {draft.active ? 'Active' : 'Inactive'}
              </button>
              <button
                onClick={onClose}
                aria-label="Close panel"
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-6 py-5 thin-scroll">
            <section>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Category">
                  <Select
                    value={catName}
                    onChange={(e) => {
                      const newName = e.target.value as CategoryName;
                      update('category' as any, { id: `cat-${newName.toLowerCase()}`, name: newName, slug: newName.toLowerCase() });
                    }}
                  >
                    {activeCategories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Unit of Measure">
                  <Select
                    value={unitLbl}
                    onChange={(e) => {
                      const val = e.target.value;
                      update('unitLabel' as any, val);
                      update('unitOfMeasure' as any, val.toUpperCase());
                    }}
                  >
                    {units.map((u) => (
                      <option key={u}>{u}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Unit Price (Rs.)">
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => update('unitPrice' as any, Number(e.target.value) || 0)}
                    className="font-mono tabular"
                  />
                </Field>
                <Field label="Cost Price (Rs.)">
                  <Input
                    type="number"
                    value={cost}
                    onChange={(e) => update('costPrice' as any, Number(e.target.value) || 0)}
                    className="font-mono tabular"
                  />
                </Field>
                <Field label="Tax Rate">
                  <Select defaultValue="10% VAT">
                    <option>0% Exempt</option>
                    <option>10% VAT</option>
                    <option>18% VAT</option>
                  </Select>
                </Field>
                <Field
                  label="Reorder Threshold"
                  hint="Triggers a low-stock alert at or below this level."
                >
                  <Input
                    type="number"
                    value={reorder}
                    onChange={(e) => update('reorderThreshold' as any, Number(e.target.value) || 0)}
                    className="font-mono tabular"
                  />
                </Field>
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Stock by Branch</h3>
                <Link
                  to="/inventory"
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  Adjust in Inventory
                  <ArrowRightIcon className="h-3 w-3" aria-hidden="true" />
                </Link>
              </div>
              <div className="overflow-hidden rounded-card border border-slate-200">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <Th>Branch</Th>
                      <Th align="right">Quantity on Hand</Th>
                      <Th align="right">Reorder Threshold</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {branches.map((branch) => {
                      const bKey = branch.slug || branch.id;
                      const qty = draft.stock?.[bKey] ?? draft.stock?.[branch.id] ?? 0;
                      return (
                        <Tr key={branch.id}>
                          <Td className="text-slate-700">{branch.shortName || branch.name}</Td>
                          <Td align="right">
                            <span
                              className={`font-mono tabular font-semibold ${
                                qty === 0
                                  ? 'text-red-600'
                                  : qty <= reorder
                                  ? 'text-amber-600'
                                  : 'text-slate-900'
                              }`}
                            >
                              {qty}
                            </span>
                          </Td>
                          <Td align="right" className="font-mono tabular text-slate-500">
                            {reorder}
                          </Td>
                        </Tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Stock Movement History</h3>
              {history.length === 0 ? (
                <p className="rounded-card border border-dashed border-slate-300 px-4 py-6 text-center text-xs text-slate-500">
                  No movements recorded for this product yet. Sales and adjustments will appear
                  here.
                </p>
              ) : (
                <div className="overflow-hidden rounded-card border border-slate-200">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr>
                        <Th>Date</Th>
                        <Th>Type</Th>
                        <Th align="right">Qty</Th>
                        <Th>Reference</Th>
                        <Th>Note</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((row) => {
                        const qtyVal = row.quantity ?? row.qty ?? 0;
                        const refVal = row.referenceId || row.reference || '';
                        const dateVal = row.createdAt || row.at || '';
                        return (
                          <Tr key={row.id}>
                            <Td className="whitespace-nowrap text-slate-500">
                              {formatShortDateTime(dateVal)}
                            </Td>
                            <Td>
                              <Badge tone={movementTones[row.type] || 'blue'}>{row.type}</Badge>
                            </Td>
                            <Td align="right">
                              <span
                                className={`font-mono tabular font-semibold ${
                                  qtyVal > 0 ? 'text-emerald-600' : 'text-red-600'
                                }`}
                              >
                                {qtyVal > 0 ? `+${qtyVal}` : qtyVal}
                              </span>
                            </Td>
                            <Td className="font-mono text-xs text-slate-600">{refVal}</Td>
                            <Td className="text-slate-500">{row.note}</Td>
                          </Tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Suppliers</h3>
                <Link
                  to="/suppliers"
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  Manage Supplier Directory
                  <ArrowRightIcon className="h-3 w-3" aria-hidden="true" />
                </Link>
              </div>

              <div className="space-y-4 rounded-card border border-slate-200 p-4">
                <Field
                  label="Primary / Preferred Supplier"
                  hint="Used automatically for default reorders and primary purchase orders."
                >
                  <Select
                    value={draft.preferredSupplier?.name || draft.supplier || ''}
                    onChange={(e) => {
                      const selectedName = e.target.value;
                      const found = suppliers.find((s) => s.name === selectedName);
                      const suppObj = found
                        ? { id: found.id, name: found.name }
                        : selectedName
                        ? { id: `s-${selectedName.toLowerCase().replace(/\s+/g, '-')}`, name: selectedName }
                        : null;

                      setDraft((prev) => {
                        if (!prev) return prev;
                        const existing = prev.suppliers || [];
                        const nextSuppliers =
                          suppObj && !existing.some((s) => s.id === suppObj.id || s.name === suppObj.name)
                            ? [...existing, suppObj]
                            : existing;

                        return {
                          ...prev,
                          preferredSupplier: suppObj,
                          supplier: suppObj?.name,
                          suppliers: nextSuppliers,
                        };
                      });
                      setDirty(true);
                    }}
                  >
                    <option value="">Select Primary Supplier...</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </Select>
                </Field>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">
                      Assigned Suppliers ({draft.suppliers?.length || 1})
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Select multiple suppliers that supply this product
                    </span>
                  </div>

                  <div className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50/50 p-3 sm:grid-cols-2">
                    {suppliers.map((supplier) => {
                      const isPrimary =
                        draft.preferredSupplier?.id === supplier.id ||
                        draft.preferredSupplier?.name === supplier.name;
                      const isAssigned =
                        (draft.suppliers || []).some(
                          (s) => s.id === supplier.id || s.name === supplier.name
                        ) || isPrimary;

                      return (
                        <label
                          key={supplier.id}
                          className={`flex cursor-pointer items-center justify-between rounded-md border p-2 text-xs transition-colors ${
                            isAssigned
                              ? 'border-brand-300 bg-brand-50/40 font-medium text-brand-900'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isAssigned}
                              disabled={isPrimary}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setDraft((prev) => {
                                  if (!prev) return prev;
                                  const currentList = prev.suppliers || [];
                                  let nextList: typeof currentList;
                                  if (checked) {
                                    nextList = [...currentList, { id: supplier.id, name: supplier.name }];
                                  } else {
                                    nextList = currentList.filter(
                                      (s) => s.id !== supplier.id && s.name !== supplier.name
                                    );
                                  }
                                  return {
                                    ...prev,
                                    suppliers: nextList,
                                  };
                                });
                                setDirty(true);
                              }}
                              className="h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                            />
                            <span className="truncate">{supplier.name}</span>
                          </div>
                          {isPrimary && (
                            <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700">
                              Primary
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/60 px-6 py-3">
            <p className="font-mono text-xs tabular text-slate-400">
              Margin {formatCurrency(price - cost)} ·{' '}
              {price > 0 ? Math.round(((price - cost) / price) * 100) : 0}%
            </p>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={!dirty}
                onClick={() => {
                  saveProduct(draft);
                  toast.success(`${draft.name} saved`);
                  onClose();
                }}
              >
                Save changes
              </Button>
            </div>
          </div>
        </>
      )}
    </SlideOver>
  );
}