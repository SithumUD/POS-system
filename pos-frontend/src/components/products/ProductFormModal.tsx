import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Field, Input, Select } from '../ui/Field';
import { categories, units } from '../../data/products';
import { useStore } from '../../contexts/StoreContext';
import { BranchId, CategoryName, UnitOfMeasure } from '../../types';

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
}

const emptyForm = {
  name: '',
  sku: '',
  barcode: '',
  category: 'Beverages' as CategoryName,
  unitLabel: 'Bottle',
  unitOfMeasure: 'BOTTLE' as UnitOfMeasure,
  unitPrice: '',
  costPrice: '',
  reorderThreshold: '10',
  supplierName: 'Ceylon Beverages Distributors'
};

export function ProductFormModal({ open, onClose }: ProductFormModalProps) {
  const { createProduct, products, branches, suppliers, settings, categories: storeCategories } = useStore();
  const activeCategories = storeCategories && storeCategories.length > 0 ? storeCategories.map((c) => c.name) : categories;
  const [assignedSupplierIds, setAssignedSupplierIds] = useState<string[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [stock, setStock] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setForm({ ...emptyForm, reorderThreshold: String(settings.lowStockThreshold) });
      setStock(Object.fromEntries(branches.map((b) => [b.slug || b.id, '0'])));
      setAssignedSupplierIds([]);
      setErrors({});
    }
  }, [open, branches, settings.lowStockThreshold]);

  function set<K extends keyof typeof emptyForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Product name is required.';
    if (!form.sku.trim()) next.sku = 'SKU is required.';
    else if (products.some((p) => p.sku.toLowerCase() === form.sku.trim().toLowerCase()))
      next.sku = 'That SKU is already in use.';
    if (!(Number(form.unitPrice) > 0)) next.unitPrice = 'Enter a unit price above zero.';
    if (Number(form.costPrice) < 0) next.costPrice = 'Cost cannot be negative.';

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const matchedSupplier = suppliers.find((s) => s.name === form.supplierName);
    const supplierObj = matchedSupplier
      ? { id: matchedSupplier.id, name: matchedSupplier.name }
      : { id: `s-${form.supplierName.toLowerCase().replace(/\s+/g, '-')}`, name: form.supplierName };

    const selectedSuppliers = suppliers
      .filter((s) => assignedSupplierIds.includes(s.id) || (supplierObj && s.id === supplierObj.id))
      .map((s) => ({ id: s.id, name: s.name }));

    if (supplierObj && !selectedSuppliers.some((s) => s.id === supplierObj.id)) {
      selectedSuppliers.unshift(supplierObj);
    }

    const catObj = {
      id: `cat-${form.category.toLowerCase()}`,
      name: form.category,
      slug: form.category.toLowerCase()
    };

    const stockMap: Record<string, number> = {};
    branches.forEach((b) => {
      const bKey = b.slug || b.id;
      stockMap[bKey] = Number(stock[bKey]) || 0;
    });

    createProduct({
      name: form.name.trim(),
      sku: form.sku.trim().toUpperCase(),
      barcode: form.barcode.trim() || String(Math.floor(4790000000000 + Math.random() * 9999999)),
      category: catObj,
      unitPrice: Number(form.unitPrice),
      costPrice: Number(form.costPrice) || 0,
      taxRate: settings.taxRate || 10,
      reorderThreshold: Number(form.reorderThreshold) || 0,
      unitOfMeasure: form.unitOfMeasure,
      unitLabel: form.unitLabel,
      imageUrl: null,
      preferredSupplier: supplierObj,
      suppliers: selectedSuppliers,
      active: true,
      stock: stockMap as Record<BranchId, number>
    } as any);

    toast.success(`${form.name.trim()} added to the catalogue`);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="max-w-2xl"
      title="Add product"
      subtitle="New products appear on the POS terminal immediately."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Create product
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Product name" error={errors.name} className="sm:col-span-2">
            <Input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Anchor Full Cream Milk 1L"
            />
          </Field>
          <Field label="SKU" error={errors.sku}>
            <Input
              value={form.sku}
              onChange={(e) => set('sku', e.target.value)}
              placeholder="DRY-AN-1000"
              className="font-mono"
            />
          </Field>
          <Field label="Barcode" hint="Leave blank to generate one automatically.">
            <Input
              value={form.barcode}
              onChange={(e) => set('barcode', e.target.value)}
              placeholder="4791111083122"
              className="font-mono"
            />
          </Field>
          <Field label="Category">
            <Select value={form.category} onChange={(e) => set('category', e.target.value as CategoryName)}>
              {activeCategories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Unit of measure">
            <Select
              value={form.unitLabel}
              onChange={(e) => {
                const labelVal = e.target.value;
                const uom = labelVal.toUpperCase() as UnitOfMeasure;
                setForm((prev) => ({ ...prev, unitLabel: labelVal, unitOfMeasure: uom }));
              }}
            >
              {units.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </Select>
          </Field>
          <Field label="Unit price (Rs.)" error={errors.unitPrice}>
            <Input
              type="number"
              value={form.unitPrice}
              onChange={(e) => set('unitPrice', e.target.value)}
              className="font-mono tabular"
            />
          </Field>
          <Field label="Cost price (Rs.)" error={errors.costPrice}>
            <Input
              type="number"
              value={form.costPrice}
              onChange={(e) => set('costPrice', e.target.value)}
              className="font-mono tabular"
            />
          </Field>
          <Field label="Reorder threshold">
            <Input
              type="number"
              value={form.reorderThreshold}
              onChange={(e) => set('reorderThreshold', e.target.value)}
              className="font-mono tabular"
            />
          </Field>
          <Field label="Preferred supplier">
            <Select
              value={form.supplierName}
              onChange={(e) => {
                const name = e.target.value;
                set('supplierName', name);
                const found = suppliers.find((s) => s.name === name);
                if (found && !assignedSupplierIds.includes(found.id)) {
                  setAssignedSupplierIds((prev) => [...prev, found.id]);
                }
              }}
            >
              {suppliers.map((supplier) => (
                <option key={supplier.id}>{supplier.name}</option>
              ))}
            </Select>
          </Field>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium text-slate-700">Assigned suppliers (Multiple)</p>
          <p className="mb-2 text-[11px] text-slate-500">
            Select all suppliers that can provide this product
          </p>
          <div className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50/50 p-3 sm:grid-cols-2">
            {suppliers.map((s) => {
              const matchedPrimary = suppliers.find((sp) => sp.name === form.supplierName);
              const isPrimary = matchedPrimary?.id === s.id;
              const isChecked = assignedSupplierIds.includes(s.id) || isPrimary;

              return (
                <label
                  key={s.id}
                  className={`flex cursor-pointer items-center justify-between rounded border p-2 text-xs transition-colors ${
                    isChecked
                      ? 'border-brand-300 bg-brand-50/40 font-medium text-brand-900'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={isPrimary}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAssignedSupplierIds((prev) => [...prev, s.id]);
                        } else {
                          setAssignedSupplierIds((prev) => prev.filter((id) => id !== s.id));
                        }
                      }}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="truncate">{s.name}</span>
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

        <div>
          <p className="mb-2 text-xs font-medium text-slate-700">Opening stock by branch</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {branches.map((branch) => {
              const bKey = branch.slug || branch.id;
              const bDisp = branch.shortName || branch.name;
              return (
                <label key={branch.id} className="block">
                  <span className="mb-1 block text-xs text-slate-500">{bDisp}</span>
                  <Input
                    type="number"
                    value={stock[bKey] ?? '0'}
                    onChange={(e) =>
                      setStock((prev) => ({ ...prev, [bKey]: e.target.value }))
                    }
                    className="font-mono tabular"
                  />
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}