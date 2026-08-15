import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Role } from '../../api/types';
import { Loader2Icon, ShieldAlertIcon } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2Icon className="h-8 w-8 animate-spin text-brand-600" />
          <p className="text-sm font-medium">Connecting to NexPOS Backend…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const isCashier = user.role === 'CASHIER';
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 ring-8 ring-amber-50/50">
            <ShieldAlertIcon className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-slate-900">Access Restricted</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Your current role (<span className="font-mono font-bold uppercase text-brand-700 bg-brand-50 px-2 py-0.5 rounded">{user.role}</span>) does not have permission to view this page.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            {isCashier ? (
              <a
                href="/pos"
                className="w-full sm:w-auto inline-flex h-10 items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition-all hover:bg-brand-700 shadow-md shadow-brand-500/20"
              >
                Go to POS Terminal
              </a>
            ) : (
              <a
                href="/dashboard"
                className="w-full sm:w-auto inline-flex h-10 items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition-all hover:bg-brand-700 shadow-md shadow-brand-500/20"
              >
                Go to Dashboard
              </a>
            )}
            <button
              onClick={() => window.history.back()}
              className="w-full sm:w-auto inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;
