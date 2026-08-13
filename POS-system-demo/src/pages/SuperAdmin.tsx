import React, { useState } from 'react';
import { Shield, Building2, Mail, CheckCircle, XCircle, Clock, AlertCircle, LogOut, Users, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { demoTenants, planColors, planLabels } from '../data/superAdmin';
import { PlanType } from '../api/types';
import { toast } from 'sonner';

type TenantStatus = 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'INVITED' | 'PENDING_APPROVAL';

export default function SuperAdmin() {
  const [activeTab, setActiveTab] = useState<'tenants' | 'invite'>('tenants');
  const [tenants, setTenants] = useState(demoTenants);
  const { logout } = useAuth();

  // Invite Form State
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePlan, setInvitePlan] = useState<PlanType>('STARTER');
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState('');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setInviteSuccess('');
    await new Promise((r) => setTimeout(r, 800));
    setInviteSuccess(`Invitation sent successfully to ${inviteEmail}`);
    setInviteEmail('');
    toast.success(`Invitation sent to ${inviteEmail}`);
    setInviting(false);
  };

  const handleSuspend = (id: string) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'SUSPENDED' as TenantStatus } : t))
    );
    toast.info('Tenant suspended in demo mode');
  };

  const handleActivate = (id: string) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'ACTIVE' as TenantStatus } : t))
    );
    toast.success('Tenant activated in demo mode');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><CheckCircle className="w-3 h-3 mr-1" /> Active</span>;
      case 'TRIAL':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800"><Clock className="w-3 h-3 mr-1" /> Trial</span>;
      case 'INVITED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><Mail className="w-3 h-3 mr-1" /> Invited</span>;
      case 'SUSPENDED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Suspended</span>;
      case 'PENDING_APPROVAL':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"><AlertCircle className="w-3 h-3 mr-1" /> Pending</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Demo badge */}
      <div className="mb-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-sm text-amber-800 w-fit">
        <span className="text-base">🎬</span>
        <span><b>Demo Mode</b> — Super Admin data is simulated. No real tenant accounts.</span>
      </div>

      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:text-3xl sm:truncate flex items-center gap-3">
            <Shield className="h-8 w-8 text-indigo-600" />
            Super Admin Dashboard
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage SaaS tenants across Sri Lanka — {tenants.filter((t) => t.status === 'ACTIVE').length} active businesses.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={logout}
            className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Tenants', value: tenants.length, color: 'text-indigo-600' },
          { label: 'Active', value: tenants.filter((t) => t.status === 'ACTIVE').length, color: 'text-emerald-600' },
          { label: 'Trial', value: tenants.filter((t) => t.status === 'TRIAL').length, color: 'text-sky-600' },
          { label: 'Suspended', value: tenants.filter((t) => t.status === 'SUSPENDED').length, color: 'text-red-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('tenants')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tenants'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Building2 className="w-4 h-4 inline mr-2" />
            Tenants ({tenants.length})
          </button>
          <button
            onClick={() => setActiveTab('invite')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'invite'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Mail className="w-4 h-4 inline mr-2" />
            Invite Business
          </button>
        </nav>
      </div>

      {activeTab === 'tenants' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-slate-200">
            {tenants.map((tenant) => (
              <li key={tenant.id} className="p-5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="text-base font-semibold text-slate-900 truncate">
                        {tenant.businessName}
                      </p>
                      {getStatusBadge(tenant.status)}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${planColors[(tenant.plan as PlanType) || 'STARTER']}`}>
                        {planLabels[(tenant.plan as PlanType) || 'STARTER']}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {tenant.ownerEmail}
                      </span>
                      {tenant.subdomain && (
                        <span className="flex items-center gap-1">
                          🌐 {tenant.subdomain}.nexpos.lk
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" />
                        {tenant.branchCount} {tenant.branchCount === 1 ? 'branch' : 'branches'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {tenant.userCount} users
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {tenant.status === 'SUSPENDED' && (
                      <button
                        onClick={() => handleActivate(tenant.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-emerald-600 hover:bg-emerald-700"
                      >
                        Reactivate
                      </button>
                    )}
                    {tenant.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleSuspend(tenant.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-slate-300 text-xs font-medium rounded shadow-sm text-red-700 bg-white hover:bg-red-50"
                      >
                        Suspend
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'invite' && (
        <div className="bg-white shadow sm:rounded-lg max-w-2xl">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-slate-900 mb-4">Invite a New Business</h3>
            {inviteSuccess && (
              <div className="mb-4 bg-emerald-50 border-l-4 border-emerald-400 p-4 rounded-md">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-emerald-400 mr-2" />
                  <p className="text-sm text-emerald-700">{inviteSuccess}</p>
                </div>
              </div>
            )}
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Business Email</label>
                <div className="mt-1">
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300 rounded-md py-2 px-3 border"
                    placeholder="owner@business.lk"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Plan</label>
                <div className="mt-1">
                  <select
                    value={invitePlan}
                    onChange={(e) => setInvitePlan(e.target.value as PlanType)}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300 rounded-md py-2 px-3 border bg-white"
                  >
                    <option value="STARTER">Starter — Up to 3 users, 1 branch</option>
                    <option value="PROFESSIONAL">Professional — Up to 20 users, 5 branches</option>
                    <option value="ENTERPRISE">Enterprise — Unlimited users & branches</option>
                  </select>
                </div>
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={inviting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {inviting ? 'Sending invitation...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
