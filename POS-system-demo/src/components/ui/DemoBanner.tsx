import React, { useState } from 'react';
import { useStore } from '../../contexts/StoreContext';
import { Role } from '../../types';

const ROLES: { role: Role; label: string; emoji: string; color: string }[] = [
  { role: 'ADMIN', label: 'Admin', emoji: '👑', color: 'bg-indigo-600 text-white' },
  { role: 'MANAGER', label: 'Manager', emoji: '🏪', color: 'bg-emerald-600 text-white' },
  { role: 'CASHIER', label: 'Cashier', emoji: '💳', color: 'bg-sky-600 text-white' },
  { role: 'VIEWER', label: 'Viewer', emoji: '👁', color: 'bg-slate-600 text-white' },
];

export function DemoBanner() {
  const { currentUserRole, setCurrentUserRole } = useStore();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating pill trigger */}
      <button
        id="demo-banner-toggle"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-slate-900/90 backdrop-blur-sm px-4 py-2.5 text-sm font-medium text-white shadow-lg hover:bg-slate-800 transition-all duration-200 border border-white/10"
        aria-label="Toggle demo panel"
      >
        <span className="text-base">🎬</span>
        <span className="hidden sm:inline">Demo Mode</span>
        <span className="ml-1 text-xs bg-white/20 rounded-full px-2 py-0.5">{currentUserRole}</span>
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-72 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-white/10 shadow-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-semibold text-sm">🎬 Demo Mode</p>
              <p className="text-xs text-slate-400 mt-0.5">No backend required</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white text-lg leading-none"
            >
              ×
            </button>
          </div>

          <div className="border-t border-white/10 pt-3 mb-3">
            <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide font-medium">Switch Role</p>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map(({ role, label, emoji, color }) => (
                <button
                  key={role}
                  id={`demo-role-${role.toLowerCase()}`}
                  onClick={() => {
                    setCurrentUserRole(role);
                    setOpen(false);
                  }}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    currentUserRole === role
                      ? color
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  <span>{emoji}</span>
                  {label}
                  {currentUserRole === role && <span className="ml-auto text-xs opacity-75">✓</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 pt-3 space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Products</span><span className="text-white font-medium">100 items</span>
            </div>
            <div className="flex justify-between">
              <span>Sales History</span><span className="text-white font-medium">1,000+ records</span>
            </div>
            <div className="flex justify-between">
              <span>Branches</span><span className="text-white font-medium">5 locations</span>
            </div>
            <div className="flex justify-between">
              <span>Currency</span><span className="text-white font-medium">LKR (Sri Lankan Rupee)</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
