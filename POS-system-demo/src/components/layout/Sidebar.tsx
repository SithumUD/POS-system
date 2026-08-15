import React from 'react';
import { NavLink } from 'react-router-dom';
import { useStore } from '../../contexts/StoreContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboardIcon,
  ScanBarcodeIcon,
  PackageIcon,
  BoxesIcon,
  ClipboardListIcon,
  TruckIcon,
  ReceiptTextIcon,
  BarChart3Icon,
  CoinsIcon,
  ShieldAlertIcon,
  StoreIcon,
  SettingsIcon,
  LogOutIcon,
  ShieldCheckIcon,
  UserIcon,
} from 'lucide-react';

// ── NexPOS inline SVG logo mark ──────────────────────────────────────────────
function NexPOSMark({ size = 30 }: { size?: number }) {
  return (
    <img 
      src="/logo.png" 
      alt="NexPOS Logo" 
      style={{ width: size, height: size, objectFit: 'contain' }} 
    />
  );
}

import { Role } from '../../types';

const navItems: Array<{
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles: Role[];
  badge?: string;
}> = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboardIcon, allowedRoles: ['ADMIN', 'MANAGER'] },
  { to: '/pos', label: 'POS Terminal', icon: ScanBarcodeIcon, allowedRoles: ['ADMIN', 'MANAGER', 'CASHIER'] },
  { to: '/products', label: 'Products', icon: PackageIcon, allowedRoles: ['ADMIN', 'MANAGER'] },
  { to: '/inventory', label: 'Inventory', icon: BoxesIcon, allowedRoles: ['ADMIN', 'MANAGER'] },
  { to: '/purchase-orders', label: 'Purchase Orders', icon: ClipboardListIcon, allowedRoles: ['ADMIN', 'MANAGER'] },
  { to: '/suppliers', label: 'Suppliers', icon: TruckIcon, allowedRoles: ['ADMIN', 'MANAGER'] },
  { to: '/sales-history', label: 'Sales History', icon: ReceiptTextIcon, allowedRoles: ['ADMIN', 'MANAGER', 'CASHIER'] },
  { to: '/reports', label: 'Reports', icon: BarChart3Icon, allowedRoles: ['ADMIN', 'MANAGER'] },
  { to: '/finance', label: 'Finance & Analytics', icon: CoinsIcon, allowedRoles: ['ADMIN', 'MANAGER'], badge: 'Admin/Mgr' },
  { to: '/alerts', label: 'Anomaly Alerts', icon: ShieldAlertIcon, allowedRoles: ['ADMIN', 'MANAGER'] },
  { to: '/branches', label: 'Branches', icon: StoreIcon, allowedRoles: ['ADMIN'] },
  { to: '/settings', label: 'Settings', icon: SettingsIcon, allowedRoles: ['ADMIN', 'MANAGER'] },
];

export function Sidebar() {
  const { alerts, settings } = useStore();
  const { user, logout } = useAuth();

  const userRole = (user?.role || 'CASHIER') as Role;
  const visibleNavItems = navItems.filter((item) =>
    item.allowedRoles.includes(userRole)
  );

  const openAlerts = alerts.filter(
    (a) =>
      a.status === 'NEW' ||
      a.status === 'INVESTIGATING' ||
      a.status === ('New' as any) ||
      a.status === ('Investigating' as any)
  ).length;

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
      {/* Brand header */}
      <div className="border-b border-slate-100 p-3">
        <div className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left">
          <NexPOSMark size={30} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-slate-900">
              {settings?.storeName || 'NexPOS'}
            </span>
            <span className="block truncate text-xs text-slate-500">
              {user?.branchName || user?.branchSlug || 'Main Branch'}
            </span>
          </span>
        </div>
      </div>

      <nav aria-label="Main" className="flex-1 overflow-y-auto p-3 thin-scroll">
        <ul className="space-y-0.5">
          {visibleNavItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-brand-50 font-medium text-brand-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-500'
                      }`}
                      aria-hidden="true"
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-200">
                        {item.badge}
                      </span>
                    )}
                    {item.to === '/alerts' && openAlerts > 0 && (
                      <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                        {openAlerts}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Authenticated User Profile & Sign Out */}
      <div className="border-t border-slate-100 p-3 space-y-2">
        <div className="rounded-lg bg-slate-50 p-2.5 ring-1 ring-inset ring-slate-200/60">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-900">{user?.name || 'Logged User'}</p>
              <p className="truncate text-[11px] text-slate-500">{user?.email || 'user@nexpos.app'}</p>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-slate-200/60 pt-2">
            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
              <ShieldCheckIcon className="h-3.5 w-3.5 text-brand-600" /> Role
            </span>
            <span className="font-mono text-[10px] uppercase font-bold text-brand-700 bg-brand-100 px-1.5 py-0.5 rounded">
              {user?.role || 'CASHIER'}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-200"
        >
          <LogOutIcon className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;