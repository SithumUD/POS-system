import React from 'react';
import { Link } from 'react-router-dom';
import { BellIcon } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useStore } from '../../contexts/StoreContext';
import { DemoBanner } from '../ui/DemoBanner';

interface AppShellProps {
  title: string;
  toolbar?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({ title, toolbar, actions, children }: AppShellProps) {
  const { alerts } = useStore();
  const unread = alerts.filter((a) => a.status === 'NEW' || a.status === ('New' as any)).length;

  return (
    <div className="flex h-full min-h-full w-full bg-slate-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white/90 px-6 py-3 backdrop-blur">
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h1>
          <div className="flex flex-1 flex-wrap items-center gap-2">{toolbar}</div>
          <div className="flex items-center gap-2">
            {actions}
            <Link
              to="/alerts"
              className="relative rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
              aria-label={`Notifications, ${unread} unread`}>
              
              <BellIcon className="h-4 w-4" />
              {unread > 0 &&
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                  {unread}
                </span>
              }
            </Link>
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-y-auto p-6 thin-scroll">{children}</main>
      </div>
      <DemoBanner />
    </div>);

}