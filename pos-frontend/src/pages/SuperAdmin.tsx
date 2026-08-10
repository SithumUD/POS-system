import React, { useState, useEffect } from 'react';
import { Shield, Building2, Mail, CheckCircle, XCircle, Clock, AlertCircle, LogOut } from 'lucide-react';
import { superAdminApi } from '../api/superAdminApi';
import { useAuth } from '../contexts/AuthContext';
import { TenantSummaryDto, PlanType, InviteBusinessRequest } from '../api/types';

export default function SuperAdmin() {
  const [activeTab, setActiveTab] = useState<'tenants' | 'invite'>('tenants');
  const [tenants, setTenants] = useState<TenantSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();

  // Invite Form State
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePlan, setInvitePlan] = useState<PlanType>('STARTER');
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState('');

  useEffect(() => {
    if (activeTab === 'tenants') {
      fetchTenants();
    }
  }, [activeTab]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await superAdminApi.getAllTenants();
      if (res.success) {
        setTenants(res.data);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tenants');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setInviting(true);
      setInviteSuccess('');
      setError(null);
      
      const req: InviteBusinessRequest = { email: inviteEmail, plan: invitePlan };
      const res = await superAdminApi.inviteBusiness(req);
      
      if (res.success) {
        setInviteSuccess(`Invitation sent successfully to ${inviteEmail}`);
        setInviteEmail('');
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm('Are you sure you want to approve this tenant and activate their account?')) return;
    try {
      await superAdminApi.approveTenant(id);
      fetchTenants();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleSuspend = async (id: string) => {
    if (!window.confirm('Are you sure you want to suspend this tenant? All their users will lose access.')) return;
    try {
      await superAdminApi.suspendTenant(id);
      fetchTenants();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Suspension failed');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><CheckCircle className="w-3 h-3 mr-1" /> Active</span>;
      case 'PENDING_APPROVAL':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"><Clock className="w-3 h-3 mr-1" /> Pending Payment</span>;
      case 'INVITED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><Mail className="w-3 h-3 mr-1" /> Invited</span>;
      case 'SUSPENDED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Suspended</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:text-3xl sm:truncate flex items-center gap-3">
            <Shield className="h-8 w-8 text-indigo-600" />
            Super Admin Dashboard
          </h2>
          <p className="mt-1 text-sm text-slate-500">Manage SaaS tenants, plans, and approvals.</p>
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
            Tenants
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

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {activeTab === 'tenants' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading tenants...</div>
          ) : (
            <ul className="divide-y divide-slate-200">
              {tenants.map((tenant) => (
                <li key={tenant.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-lg font-semibold text-slate-900 truncate">
                          {tenant.name || 'Pending Signup'}
                        </p>
                        {getStatusBadge(tenant.status)}
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                          {tenant.plan}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6 text-sm text-slate-500">
                        <div className="mt-2 flex items-center">
                          <Mail className="flex-shrink-0 mr-1.5 h-4 w-4 text-slate-400" />
                          {tenant.contactEmail}
                        </div>
                        {tenant.businessPhone && (
                          <div className="mt-2 flex items-center">
                            <span className="mr-1.5 font-medium text-slate-400">📞</span>
                            {tenant.businessPhone}
                          </div>
                        )}
                        <div className="mt-2 flex items-center">
                          <span className="mr-1.5 font-medium text-slate-400">Limits:</span>
                          {tenant.maxUsers} Users | {tenant.maxBranches} Branches | {tenant.maxProducts} Products
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 pl-4">
                      {tenant.status === 'PENDING_APPROVAL' && (
                        <button
                          onClick={() => handleApprove(tenant.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                        >
                          Approve Payment
                        </button>
                      )}
                      {tenant.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleSuspend(tenant.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-slate-300 text-xs font-medium rounded shadow-sm text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Suspend
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
              {tenants.length === 0 && (
                <li className="p-8 text-center text-slate-500">No tenants found.</li>
              )}
            </ul>
          )}
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
                    placeholder="owner@business.com"
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
                    <option value="STARTER">Starter Plan (3 Users, 1 Branch, 5K Products)</option>
                    <option value="BUSINESS">Business Plan (15 Users, 3 Branches, 20K Products)</option>
                    <option value="PROFESSIONAL">Professional Plan (50 Users, 10 Branches, 50K Products)</option>
                  </select>
                </div>
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={inviting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {inviting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
