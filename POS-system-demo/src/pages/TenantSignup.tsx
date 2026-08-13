import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Building, User, Lock, Mail } from 'lucide-react';
import apiClient from '../api/client';
import { SignupInviteDetailsDto, TenantSignupRequest } from '../api/types';

export default function TenantSignup() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [loadingDetails, setLoadingDetails] = useState(true);
  const [details, setDetails] = useState<SignupInviteDetailsDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    businessName: '',
    businessAddress: '',
    businessPhone: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!token) {
      setError('No signup token provided in URL.');
      setLoadingDetails(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        const res = await apiClient.get(`/auth/signup-invite/${token}`);
        setDetails(res.data.data);
        setFormData(prev => ({ ...prev, adminEmail: res.data.data.contactEmail }));
      } catch (err: any) {
        setError(err.response?.data?.message || 'Invalid or expired signup link.');
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (step === 1 && !formData.businessName.trim()) {
      alert('Business Name is required');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.adminPassword !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (formData.adminPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload: TenantSignupRequest = {
      signupToken: token!,
      businessName: formData.businessName,
      businessAddress: formData.businessAddress,
      businessPhone: formData.businessPhone,
      adminName: formData.adminName,
      adminEmail: formData.adminEmail,
      adminPassword: formData.adminPassword
    };

    try {
      const res = await apiClient.post('/auth/signup', payload);
      if (res.data.success) {
        setSuccess(true);
      } else {
        setError(res.data.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit signup');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingDetails) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Verifying invitation...</div>;
  }

  if (error && !details) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Invalid Invitation</h2>
        <p className="text-slate-600 text-center max-w-md">{error}</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border-t-4 border-emerald-500">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 mb-4">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Received</h2>
          <p className="text-slate-600 mb-6">
            Your business account for <strong>{formData.businessName}</strong> has been created and is pending approval.
          </p>
          <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600 text-left mb-6 border border-slate-200">
            <p className="font-semibold text-slate-900 mb-2">Next Steps:</p>
            <ol className="list-decimal pl-4 space-y-2">
              <li>Complete your subscription payment manually.</li>
              <li>Send the payment receipt via WhatsApp to <strong>+94 70 257 5370</strong>.</li>
              <li>We will activate your account within 24 hours of confirming the payment.</li>
              <li>You will receive an email once activated.</li>
            </ol>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-12 sm:pt-20 px-4 sm:px-6">
      <div className="mb-8 text-center">
        <img src="/logo.png" alt="NexPOS Logo" className="h-12 mx-auto object-contain" />
        <p className="mt-2 text-sm text-slate-600 font-medium bg-slate-200 px-3 py-1 rounded-full inline-block">
          Business Onboarding
        </p>
      </div>

      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-indigo-600 px-6 py-4">
          <h2 className="text-white text-lg font-semibold">Complete your registration</h2>
          <p className="text-indigo-100 text-sm mt-1">
            You've been invited to the <strong>{details?.plan}</strong> plan.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <p className="text-sm text-red-700 flex items-center"><AlertCircle className="w-4 h-4 mr-2" />{error}</p>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 w-full h-0.5 bg-slate-200 -z-10" />
              <div className={`absolute left-0 top-1/2 h-0.5 bg-indigo-600 -z-10 transition-all duration-300 ${step === 2 ? 'w-full' : 'w-0'}`} />
              
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${step === 2 ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-slate-200 text-slate-500'}`}>2</div>
            </div>
            <div className="flex justify-between mt-2 text-xs font-medium text-slate-500">
              <span>Business Details</span>
              <span>Admin Account</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Business Name *</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="businessName"
                      required
                      value={formData.businessName}
                      onChange={handleChange}
                      className="pl-10 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-slate-300 rounded-lg py-2.5 border"
                      placeholder="Your Company LLC"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Business Phone</label>
                  <input
                    type="text"
                    name="businessPhone"
                    value={formData.businessPhone}
                    onChange={handleChange}
                    className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-slate-300 rounded-lg py-2.5 px-3 border"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Business Address</label>
                  <input
                    type="text"
                    name="businessAddress"
                    value={formData.businessAddress}
                    onChange={handleChange}
                    className="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-slate-300 rounded-lg py-2.5 px-3 border"
                    placeholder="123 Main St, City, Country"
                  />
                </div>
                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Continue
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Admin Full Name *</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="adminName"
                      required
                      value={formData.adminName}
                      onChange={handleChange}
                      className="pl-10 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-slate-300 rounded-lg py-2.5 border"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Admin Email</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      name="adminEmail"
                      readOnly
                      value={formData.adminEmail}
                      className="pl-10 block w-full shadow-sm bg-slate-50 text-slate-500 sm:text-sm border-slate-300 rounded-lg py-2.5 border cursor-not-allowed"
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Tied to your invitation.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Password *</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      name="adminPassword"
                      required
                      minLength={8}
                      value={formData.adminPassword}
                      onChange={handleChange}
                      className="pl-10 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-slate-300 rounded-lg py-2.5 border"
                      placeholder="Min 8 characters"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Confirm Password *</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      minLength={8}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-10 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-slate-300 rounded-lg py-2.5 border"
                      placeholder="Repeat password"
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 flex justify-center py-2.5 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-2/3 flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Complete Signup'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
