import React, { useState } from 'react';
import { toast } from 'sonner';
import { PlusIcon, PencilIcon, Trash2Icon, ShieldCheckIcon, MailIcon } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Th, Td, Tr } from '../ui/Table';
import { UserFormModal } from './UserFormModal';
import { useStore } from '../../contexts/StoreContext';
import { permissionLabels } from '../../data/operations';
import { relativeTime } from '../../utils/time';
import { User, Role, UserStatus } from '../../types';

const statusTones: Record<string, 'green' | 'red' | 'blue'> = {
  ACTIVE: 'green',
  Active: 'green',
  SUSPENDED: 'red',
  Suspended: 'red',
  INVITED: 'blue',
  Invited: 'blue'
};

const roleTones: Record<string, 'indigo' | 'blue' | 'slate' | 'amber'> = {
  ADMIN: 'indigo',
  Admin: 'indigo',
  MANAGER: 'blue',
  Manager: 'blue',
  CASHIER: 'slate',
  Cashier: 'slate',
  VIEWER: 'amber',
  Viewer: 'amber'
};

const roles: Role[] = ['ADMIN', 'MANAGER', 'CASHIER', 'VIEWER'];

function getUserName(u: User): string {
  return u.fullName || u.name || u.username || '';
}

function getBranchLabel(b: any): string {
  if (!b) return '🌐 All Branches';
  if (typeof b === 'string') return b;
  return b.shortName || b.name || b.slug || '🌐 All Branches';
}

export function UsersSection() {
  const { users, updateUser, deleteUser, permissions, setPermission } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  const activeCount = users.filter((u) => u.status === 'ACTIVE' || u.status === ('Active' as any)).length;

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardHeader
          title="Team members"
          subtitle={`${activeCount} active of ${users.length}`}
          action={
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <PlusIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Invite user
            </Button>
          }
        />

        <div className="overflow-x-auto thin-scroll">
          <table className="w-full min-w-[820px] border-collapse text-sm">
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Role</Th>
                <Th>Branch</Th>
                <Th>Status</Th>
                <Th>Last active</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const uName = getUserName(user);
                const bDisp = getBranchLabel(user.assignedBranch || user.branch);
                const lastAct = user.lastActiveAt || user.lastActive;
                return (
                  <Tr key={user.id}>
                    <Td>
                      <p className="font-medium text-slate-900">{uName}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </Td>
                    <Td>
                      <Badge tone={roleTones[user.role] || 'slate'}>{user.role}</Badge>
                    </Td>
                    <Td className="whitespace-nowrap text-slate-600">{bDisp}</Td>
                    <Td>
                      <Badge tone={statusTones[user.status] || 'slate'} dot>
                        {user.status}
                      </Badge>
                    </Td>
                    <Td className="whitespace-nowrap text-slate-500">
                      {lastAct ? relativeTime(lastAct) : 'Never'}
                    </Td>
                    <Td align="right">
                      <div className="flex items-center justify-end gap-1">
                        {(user.status === 'INVITED' || user.status === ('Invited' as any)) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              toast.success('Invitation resent', { description: user.email })
                            }
                          >
                            <MailIcon className="h-3.5 w-3.5" aria-hidden="true" />
                            Resend
                          </Button>
                        )}
                        {user.status !== 'INVITED' && user.status !== ('Invited' as any) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const isActive = user.status === 'ACTIVE' || user.status === ('Active' as any);
                              const next = isActive ? 'SUSPENDED' : 'ACTIVE';
                              updateUser(user.id, { status: next as any });
                              toast.success(
                                isActive ? `${uName} suspended` : `${uName} reactivated`
                              );
                            }}
                          >
                            {user.status === 'ACTIVE' || user.status === ('Active' as any) ? 'Suspend' : 'Reactivate'}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`Edit ${uName}`}
                          onClick={() => {
                            setEditing(user);
                            setFormOpen(true);
                          }}
                        >
                          <PencilIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`Remove ${uName}`}
                          onClick={() => {
                            const adminCount = users.filter((u) => u.role === 'ADMIN' || u.role === ('Admin' as any)).length;
                            if ((user.role === 'ADMIN' || user.role === ('Admin' as any)) && adminCount === 1) {
                              toast.error('You need at least one admin');
                              return;
                            }
                            deleteUser(user.id);
                            toast.success(`${uName} removed`);
                          }}
                        >
                          <Trash2Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        </Button>
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader
          title="Roles & permissions"
          subtitle="Changes apply to everyone holding the role."
        />

        <div className="overflow-x-auto thin-scroll">
          <table className="w-full min-w-[620px] border-collapse text-sm">
            <thead>
              <tr>
                <Th>Permission</Th>
                {roles.map((role) => (
                  <Th key={role} align="center">
                    {role}
                  </Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissionLabels.map((permission) => (
                <Tr key={permission.key}>
                  <Td>
                    <p className="font-medium text-slate-900">{permission.label}</p>
                    <p className="text-xs text-slate-500">{permission.hint}</p>
                  </Td>
                  {roles.map((role) => {
                    const permMap = (permissions as any)[role] || (permissions as any)[role.charAt(0) + role.slice(1).toLowerCase()] || {};
                    const value = permMap[permission.key] ?? false;
                    const locked = role === 'ADMIN';
                    return (
                      <Td key={role} align="center">
                        <input
                          type="checkbox"
                          checked={value}
                          disabled={locked}
                          aria-label={`${permission.label} for ${role}`}
                          onChange={(e) => setPermission(role as any, permission.key, e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500/30 disabled:opacity-50"
                        />
                      </Td>
                    );
                  })}
                </Tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 text-xs text-slate-500">
          <ShieldCheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
          Admins always retain full access and cannot be restricted.
        </p>
      </Card>

      <UserFormModal open={formOpen} onClose={() => setFormOpen(false)} user={editing} />
    </div>
  );
}