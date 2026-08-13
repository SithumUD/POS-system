import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StoreIcon, LogOutIcon, ChevronDownIcon, ClockIcon } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { useAuth } from '../../contexts/AuthContext';
import { BranchId } from '../../types';

export function PosTopBar() {
  const { branch, setBranch, online, queued, toggleOnline, branches } = useStore();
  const { user } = useAuth();
  const active = branches.find((b) => b.id === branch || b.slug === branch) ?? branches[0];
  const activeShort = active ? (active.shortName || (active as any).short || active.name) : 'Colombo Main';

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const userName = user?.name || 'Cashier';
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const userBranch = (user as any)?.assignedBranch || (user as any)?.branch;
  const hasGlobalAccess = !userBranch || userBranch === 'all' || userBranch === 'ALL';

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-5">
      <div className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-500 text-[11px] font-bold text-white">
          R
        </span>
        <div className="relative">
          <StoreIcon
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <select
            value={branch}
            disabled={!hasGlobalAccess}
            onChange={(e) => setBranch(e.target.value as BranchId)}
            aria-label="Select branch"
            className={`h-9 appearance-none rounded-lg border border-transparent bg-transparent pl-8 pr-7 text-sm font-semibold text-slate-900 focus:outline-none ${
              hasGlobalAccess
                ? 'cursor-pointer hover:border-slate-200 focus:border-brand-500'
                : 'cursor-default opacity-85'
            }`}
          >
            {branches.map((b) => (
              <option key={b.id} value={b.slug || b.id}>
                {b.shortName || b.name}
              </option>
            ))}
          </select>
          {hasGlobalAccess && (
            <ChevronDownIcon
              className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
          )}
        </div>
      </div>

      <div className="hidden items-center gap-2 text-sm md:flex">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600">
          {initials}
        </span>
        <span className="font-medium text-slate-900">{userName}</span>
        <span className="text-slate-300">·</span>
        <span className="text-slate-500">Active Shift</span>
        <span className="text-slate-300">·</span>
        <span className="text-slate-500">{activeShort}</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50/80 px-3 py-1.5 text-xs sm:flex">
          <ClockIcon className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
          <span className="font-medium text-slate-600">{formattedDate}</span>
          <span className="text-slate-300">·</span>
          <span className="font-mono font-semibold tabular text-slate-900">{formattedTime}</span>
        </div>
        <button
          onClick={toggleOnline}
          aria-pressed={!online}
          title="Toggle terminal connectivity"
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition-colors ${
          online ?
          'bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100' :
          'bg-amber-50 text-amber-700 ring-amber-200 hover:bg-amber-100'}`
          }>
          
          {online ?
          <>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Online · synced
            </> :

          <>
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Offline · {queued} sale{queued === 1 ? '' : 's'} queued
            </>
          }
        </button>
        <Link
          to="/dashboard"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50">
          
          <LogOutIcon className="h-3.5 w-3.5" aria-hidden="true" />
          Exit till
        </Link>
      </div>
    </header>);

}