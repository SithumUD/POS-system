import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Field, Input, Select, Textarea } from '../ui/Field';
import { useStore } from '../../contexts/StoreContext';
import { Supplier, SupplierStatus, CategoryName, PaymentTerms } from '../../types';
import { categories } from '../../data/products';
import { paymentTermOptions } from '../../data/purchasing';

interface SupplierFormModalProps {
  open: boolean;
  onClose: () => void;
  supplier?: Supplier | null;
}

const empty = {
  name: '',
  contactPerson: '',
  contactPhone: '',
  contactEmail: '',
  address: '',
  paymentTerms: 'NET_30' as PaymentTerms,
  leadTime: '3',
  status: 'ACTIVE' as SupplierStatus,
  notes: ''
};

export function SupplierFormModal({ open, onClose, supplier }: SupplierFormModalProps) {
  const { createSupplier, updateSupplier, suppliers } = useStore();
  const [form, setForm] = useState(empty);
  const [picked, setPicked] = useState<CategoryName[]>(['Beverages']);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setForm(
      supplier
        ? {
            name: supplier.name,
            contactPerson: supplier.contactPerson || supplier.contact || '',
            contactPhone: supplier.phone || supplier.contactPhone || '',
            contactEmail: supplier.contactEmail || supplier.email || '',
            address: supplier.address || '',
            paymentTerms: supplier.paymentTerms || 'NET_30',
            leadTime: String(supplier.leadTimeDays ?? 3),
            status: supplier.status,
            notes: supplier.notes || ''
          }
        : empty
    );
    setPicked(supplier ? ((supplier.suppliedCategories || supplier.categories || ['Beverages']) as CategoryName[]) : ['Beverages']);
    setErrors({});
  }, [open, supplier]);

  function set<K extends keyof typeof empty>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleCategory(category: CategoryName) {
    setPicked((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  }

  function handleSubmit() {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Supplier name is required.';
    else if (
      suppliers.some(
        (s) => s.id !== supplier?.id && s.name.toLowerCase() === form.name.trim().toLowerCase()
      )
    )
      next.name = 'A supplier with that name already exists.';
    if (!form.contactPerson.trim()) next.contactPerson = 'Add a contact person.';
    if (form.contactEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.contactEmail))
      next.contactEmail = 'Enter a valid email address.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const payload = {
      name: form.name.trim(),
      contactPerson: form.contactPerson.trim(),
      contactPhone: form.contactPhone.trim(),
      phone: form.contactPhone.trim(),
      contactEmail: form.contactEmail.trim(),
      address: form.address.trim(),
      paymentTerms: form.paymentTerms as PaymentTerms,
      leadTimeDays: Number(form.leadTime) || 0,
      suppliedCategories: (picked.length > 0 ? picked : ['Beverages']) as string[],
      categories: (picked.length > 0 ? picked : ['Beverages']) as CategoryName[],
      status: form.status,
      notes: form.notes.trim()
    };

    if (supplier) {
      updateSupplier(supplier.id, payload as any);
      toast.success(`${payload.name} updated`);
    } else {
      createSupplier(payload as any);
      toast.success(`${payload.name} added`, { description: 'Available on new purchase orders.' });
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={supplier ? 'Edit supplier' : 'Add supplier'}
      subtitle={
        supplier
          ? 'Updates apply to future purchase orders.'
          : 'Save supplier details for fast purchase ordering.'
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {supplier ? 'Save changes' : 'Add supplier'}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Supplier / Company name" error={errors.name} className="sm:col-span-2">
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} />
        </Field>
        <Field label="Contact person" error={errors.contactPerson}>
          <Input value={form.contactPerson} onChange={(e) => set('contactPerson', e.target.value)} />
        </Field>
        <Field label="Contact phone">
          <Input value={form.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} />
        </Field>
        <Field label="Contact email" error={errors.contactEmail} className="sm:col-span-2">
          <Input
            type="email"
            value={form.contactEmail}
            onChange={(e) => set('contactEmail', e.target.value)}
          />
        </Field>
        <Field label="Address" className="sm:col-span-2">
          <Input value={form.address} onChange={(e) => set('address', e.target.value)} />
        </Field>
        <Field label="Default payment terms">
          <Select
            value={form.paymentTerms}
            onChange={(e) => set('paymentTerms', e.target.value as PaymentTerms)}
          >
            {paymentTermOptions.map((term) => (
              <option key={term} value={term}>
                {term.replace(/_/g, ' ')}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Lead time (days)" hint="Estimated delivery turnaround.">
          <Input
            type="number"
            min={1}
            value={form.leadTime}
            onChange={(e) => set('leadTime', e.target.value)}
            className="font-mono tabular"
          />
        </Field>

        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-slate-700">Supplied categories</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {categories.map((category) => {
              const checked = picked.includes(category);
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    checked
                      ? 'bg-brand-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <Field label="Status" className="sm:col-span-2">
          <Select
            value={form.status}
            onChange={(e) => set('status', e.target.value as SupplierStatus)}
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="ON_HOLD">ON_HOLD</option>
            <option value="INACTIVE">INACTIVE</option>
          </Select>
        </Field>
        <Field label="Notes / Lead time context" className="sm:col-span-2">
          <Textarea
            rows={2}
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Minimum order value, delivery days, etc."
          />
        </Field>
      </div>
    </Modal>
  );
}