import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Field, Input, Select } from '../ui/Field';
import { useStore } from '../../contexts/StoreContext';
import { Branch, BranchStatus } from '../../types';

interface BranchFormModalProps {
  open: boolean;
  onClose: () => void;
  branch?: Branch | null;
}

const empty = {
  name: '',
  shortName: '',
  address: '',
  phone: '',
  managerName: '',
  opensAt: '08:00',
  closesAt: '21:00',
  terminalCount: '2',
  status: 'SETUP' as BranchStatus
};

function getManagerVal(b: Branch | null | undefined): string {
  if (!b || !b.manager) return '';
  if (typeof b.manager === 'string') return b.manager;
  return b.manager.name || '';
}

export function BranchFormModal({ open, onClose, branch }: BranchFormModalProps) {
  const { createBranch, updateBranch, users, branches } = useStore();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setForm(
      branch
        ? {
            name: branch.name,
            shortName: branch.shortName || branch.name,
            address: branch.address || '',
            phone: branch.phone || '',
            managerName: getManagerVal(branch),
            opensAt: branch.opensAt || '08:00',
            closesAt: branch.closesAt || '21:00',
            terminalCount: String(branch.terminalCount || 1),
            status: branch.status
          }
        : empty
    );
    setErrors({});
  }, [open, branch]);

  function set<K extends keyof typeof empty>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Branch name is required.';
    if (!form.shortName.trim()) next.shortName = 'A short label is required.';
    else if (
      branches.some(
        (b) =>
          b.id !== branch?.id &&
          (b.shortName || b.name).toLowerCase() === form.shortName.trim().toLowerCase()
      )
    ) {
      next.shortName = 'That short label is already used.';
    }
    if (!form.address.trim()) next.address = 'Add a street address.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const matchedUser = users.find((u) => u.name === form.managerName);
    const managerObj = matchedUser
      ? { id: matchedUser.id, name: matchedUser.name, email: matchedUser.email, role: matchedUser.role }
      : form.managerName
      ? { id: `u-${form.managerName.toLowerCase().replace(/\s+/g, '-')}`, name: form.managerName }
      : null;

    const payload = {
      slug: (branch?.slug || form.shortName.trim()).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: form.name.trim(),
      shortName: form.shortName.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      manager: managerObj,
      opensAt: form.opensAt,
      closesAt: form.closesAt,
      terminalCount: Number(form.terminalCount) || 1,
      status: form.status
    };

    const bKey = branch?.slug || branch?.id;

    if (branch && bKey) {
      updateBranch(bKey, payload);
      toast.success(`${payload.shortName} updated`);
    } else {
      createBranch(payload as any);
      toast.success(`${payload.shortName} added`, {
        description: 'Every product now tracks stock at this branch.'
      });
    }
    onClose();
  }

  const managers = users.filter((u) => u.role !== 'CASHIER');

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="max-w-2xl"
      title={branch ? `Manage ${branch.shortName || branch.name}` : 'Add branch'}
      subtitle="Branches appear across the POS, inventory, transfers and reporting."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {branch ? 'Save changes' : 'Create branch'}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Branch name" error={errors.name} className="sm:col-span-2">
          <Input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Negombo Branch"
          />
        </Field>
        <Field label="Short label" error={errors.shortName} hint="Used in tables and receipts.">
          <Input
            value={form.shortName}
            onChange={(e) => set('shortName', e.target.value)}
            placeholder="Negombo"
          />
        </Field>
        <Field label="Phone">
          <Input
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="+94 31 222 4400"
          />
        </Field>
        <Field label="Address" error={errors.address} className="sm:col-span-2">
          <Input value={form.address} onChange={(e) => set('address', e.target.value)} />
        </Field>
        <Field label="Branch manager">
          <Select value={form.managerName} onChange={(e) => set('managerName', e.target.value)}>
            <option value="">Unassigned</option>
            {managers.map((u) => (
              <option key={u.id} value={u.name}>
                {u.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Status">
          <Select value={form.status} onChange={(e) => set('status', e.target.value as BranchStatus)}>
            <option value="OPEN">Open</option>
            <option value="CLOSED">Temporarily closed</option>
            <option value="SETUP">In setup</option>
          </Select>
        </Field>
        <Field label="Opens at">
          <Input type="time" value={form.opensAt} onChange={(e) => set('opensAt', e.target.value)} />
        </Field>
        <Field label="Closes at">
          <Input
            type="time"
            value={form.closesAt}
            onChange={(e) => set('closesAt', e.target.value)}
          />
        </Field>
        <Field label="POS terminals">
          <Input
            type="number"
            min={1}
            value={form.terminalCount}
            onChange={(e) => set('terminalCount', e.target.value)}
            className="font-mono tabular"
          />
        </Field>
      </div>
    </Modal>
  );
}