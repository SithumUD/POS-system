import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Field, Input, Select } from '../ui/Field';
import { useStore } from '../../contexts/StoreContext';
import { User, Role, UserStatus } from '../../types';

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  user?: User | null;
}

const empty = {
  name: '',
  email: '',
  role: 'CASHIER' as Role,
  branch: 'Colombo – Main',
  status: 'INVITED' as UserStatus
};

function getBranchKey(b: any): string {
  if (!b) return '';
  if (typeof b === 'string') return b;
  return b.slug || b.id || '';
}

function getBranchDisp(b: any): string {
  if (!b) return '';
  if (typeof b === 'string') return b;
  return b.shortName || b.name || '';
}

export function UserFormModal({ open, onClose, user }: UserFormModalProps) {
  const { createUser, updateUser, users, branches, permissions } = useStore();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    const defaultB = branches[0] ? (branches[0].slug || branches[0].id) : 'all';
    setForm(
      user
        ? {
            name: user.fullName || user.name || user.username || '',
            email: user.email,
            role: user.role,
            branch: getBranchKey(user.assignedBranch || user.branch),
            status: user.status
          }
        : { ...empty, branch: defaultB }
    );
    setErrors({});
  }, [open, user, branches]);

  function set<K extends keyof typeof empty>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Full name is required.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) next.email = 'Enter a valid work email.';
    else if (
      users.some((u) => u.id !== user?.id && u.email.toLowerCase() === form.email.toLowerCase())
    )
      next.email = 'That email already has an account.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const isAll = !form.branch || form.branch === 'all' || form.branch === 'ALL';
    const matchedBranch = isAll ? null : branches.find((b) => (b.slug || b.id) === form.branch);
    const branchObj = isAll
      ? null
      : matchedBranch
      ? { id: matchedBranch.id, name: matchedBranch.name, slug: matchedBranch.slug }
      : { id: form.branch, name: form.branch, slug: form.branch };

    const payload = {
      name: form.name.trim(),
      fullName: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      role: form.role,
      branch: branchObj,
      assignedBranch: branchObj,
      branchSlug: isAll ? null : (matchedBranch ? matchedBranch.slug : form.branch),
      status: form.status
    };

    if (user) {
      updateUser(user.id, payload as any);
      toast.success(`${payload.fullName} updated`);
    } else {
      createUser({
        username: form.email.split('@')[0],
        fullName: form.name.trim(),
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        role: form.role,
        branch: branchObj,
        assignedBranch: branchObj,
        branchSlug: isAll ? null : (matchedBranch ? matchedBranch.slug : form.branch),
        status: form.status
      } as any);
      toast.success('Invitation sent', { description: `${payload.email} · ${payload.role}` });
    }
    onClose();
  }

  const rolePerms = (permissions as any)[form.role] || (permissions as any)[form.role.charAt(0) + form.role.slice(1).toLowerCase()] || {};
  const granted = Object.entries(rolePerms).filter(([, value]) => value).length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={user ? 'Edit team member' : 'Invite team member'}
      subtitle={
        user
          ? 'Changes apply the next time this person signs in.'
          : 'They receive an email invitation to set a password.'
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {user ? 'Save changes' : 'Send invitation'}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" error={errors.name} className="sm:col-span-2">
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} />
        </Field>
        <Field label="Work email" error={errors.email} className="sm:col-span-2">
          <Input
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="name@nexpos.app"
          />
        </Field>
        <Field label="Role" hint={`${granted} of 6 permissions`}>
          <Select value={form.role} onChange={(e) => set('role', e.target.value as Role)}>
            <option value="ADMIN">ADMIN</option>
            <option value="MANAGER">MANAGER</option>
            <option value="CASHIER">CASHIER</option>
            <option value="VIEWER">VIEWER (Read-Only)</option>
          </Select>
        </Field>
        <Field label="Assigned branch">
          <Select value={form.branch} onChange={(e) => set('branch', e.target.value)}>
            <option value="all">🌐 All Branches (Global Access)</option>
            {branches.map((b) => (
              <option key={b.id} value={b.slug || b.id}>
                {getBranchDisp(b)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Account status" className="sm:col-span-2">
          <Select value={form.status} onChange={(e) => set('status', e.target.value as UserStatus)}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INVITED">INVITED</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </Select>
        </Field>
      </div>
    </Modal>
  );
}