import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { KeyRound, Mail, User, Building, AlertCircle, ArrowRight } from 'lucide-react';
import { authApi } from '../api/authApi';
import { useAuth } from '../contexts/AuthContext';

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<any>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing invitation token.');
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        const response = await authApi.getInvitationDetails(token);
        if (response.success && response.data) {
          setDetails(response.data);
        } else {
          setError(response.message || 'Invitation is invalid or has expired.');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Invitation is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await authApi.acceptInvitation({ token: token!, password });
      if (response.success) {
        // Assuming authApi stored the token in localStorage
        window.location.href = '/dashboard'; // Force full reload to initialize context
      } else {
        setError(response.message || 'Failed to activate account.');
        setSubmitting(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to activate account.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error && !details) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-slate-100">
          <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Invalid Invitation</h2>
          <p className="text-slate-600 mb-8">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-slate-900 text-white rounded-lg px-4 py-3 font-medium hover:bg-slate-800 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white mb-6 shadow-lg shadow-indigo-600/20">
            <KeyRound size={32} strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Activate your account</h2>
          <p className="text-slate-500 mt-2 font-medium">Welcome to NexPOS</p>
        </div>

        {/* Activation Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Profile Summary */}
          <div className="bg-slate-50 p-6 border-b border-slate-100">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-700">
                <User size={20} className="text-slate-400" />
                <span className="font-medium">{details?.name}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Mail size={20} className="text-slate-400" />
                <span>{details?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Building size={20} className="text-slate-400" />
                <div className="flex items-center gap-2">
                  <span>{details?.branchName}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                    {details?.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm font-medium flex items-start gap-3 border border-red-100">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Set Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  placeholder="At least 8 characters"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  placeholder="Repeat your password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-lg px-4 py-3 font-semibold hover:bg-indigo-700 active:bg-indigo-800 focus:ring-4 focus:ring-indigo-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {submitting ? (
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Activate & Login</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
