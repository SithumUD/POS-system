"use client";

import { Suspense, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Store, User, CreditCard, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const PLAN_PRICES: Record<string, string> = {
  starter: "4,500",
  business: "7,500",
  professional: "12,500",
  enterprise: "Custom"
};

function RegisterForm() {
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get("plan") || "starter";
  
  const [step, setStep] = useState(1);
  const [plan, setPlan] = useState(initialPlan);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    branchAddress: "",
    adminName: "",
    adminEmail: "",
    password: "",
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handlePayment = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      nextStep(); // Go to success step
    }, 2500); // Mock delay
  };

  const steps = [
    { title: "Plan", icon: <Check className="w-5 h-5" /> },
    { title: "Business", icon: <Store className="w-5 h-5" /> },
    { title: "Admin", icon: <User className="w-5 h-5" /> },
    { title: "Payment", icon: <CreditCard className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        
        {/* Progress Bar */}
        {step < 5 && (
          <div className="mb-12 flex justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -z-10 -translate-y-1/2" />
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-primary -z-10 -translate-y-1/2 transition-all duration-500"
              style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
            />
            
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  step > i + 1 ? 'bg-primary border-primary text-white' : 
                  step === i + 1 ? 'bg-background border-primary text-primary' : 
                  'bg-background border-white/20 text-zinc-500'
                }`}>
                  {s.icon}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${step >= i + 1 ? 'text-white' : 'text-zinc-500'}`}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Content Container */}
        <div className="glass-card rounded-3xl p-6 sm:p-10 relative overflow-hidden">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: PLAN */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold">Confirm your plan</h2>
                <p className="text-zinc-400">You can always upgrade or downgrade later.</p>
                
                <div className="grid gap-4">
                  {Object.entries(PLAN_PRICES).map(([key, price]) => (
                    <label 
                      key={key} 
                      className={`flex items-center justify-between p-5 rounded-2xl border cursor-pointer transition-all ${
                        plan === key 
                          ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(79,70,229,0.2)]' 
                          : 'border-white/10 bg-white/5 hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <input 
                          type="radio" 
                          name="plan" 
                          value={key}
                          checked={plan === key}
                          onChange={(e) => setPlan(e.target.value)}
                          className="w-5 h-5 text-primary bg-background border-white/20 focus:ring-primary focus:ring-2"
                        />
                        <div>
                          <p className="font-semibold capitalize text-lg">{key}</p>
                          <p className="text-sm text-zinc-400">
                            {key === 'starter' && 'Basic features, 1 branch'}
                            {key === 'business' && 'Advanced features, 3 branches'}
                            {key === 'professional' && 'Premium analytics, 10 branches'}
                            {key === 'enterprise' && 'Custom setup'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{price !== "Custom" ? `Rs. ${price}` : price}</p>
                        {price !== "Custom" && <p className="text-xs text-zinc-400">/ month</p>}
                      </div>
                    </label>
                  ))}
                </div>

                <div className="pt-6 flex justify-end">
                  <button onClick={nextStep} className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2 transition-all">
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: BUSINESS */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold">Business Details</h2>
                <p className="text-zinc-400">Tell us about your company to set up your first tenant and branch.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Business Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Acme Retail"
                      value={formData.businessName}
                      onChange={e => setFormData({...formData, businessName: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Main Branch Address</label>
                    <textarea 
                      placeholder="Street address, City"
                      value={formData.branchAddress}
                      onChange={e => setFormData({...formData, branchAddress: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white h-24 resize-none"
                    />
                  </div>
                </div>

                <div className="pt-6 flex justify-between">
                  <button onClick={prevStep} className="px-6 py-3 rounded-full font-semibold text-zinc-400 hover:text-white transition-colors">
                    Back
                  </button>
                  <button 
                    onClick={nextStep} 
                    disabled={!formData.businessName}
                    className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2 transition-all"
                  >
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: ADMIN */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold">Admin Account</h2>
                <p className="text-zinc-400">Create the super-admin account for {formData.businessName || 'your business'}.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="John Doe"
                      value={formData.adminName}
                      onChange={e => setFormData({...formData, adminName: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="admin@example.com"
                      value={formData.adminEmail}
                      onChange={e => setFormData({...formData, adminEmail: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white"
                    />
                  </div>
                </div>

                <div className="pt-6 flex justify-between">
                  <button onClick={prevStep} className="px-6 py-3 rounded-full font-semibold text-zinc-400 hover:text-white transition-colors">
                    Back
                  </button>
                  <button 
                    onClick={nextStep}
                    disabled={!formData.adminName || !formData.adminEmail || !formData.password}
                    className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2 transition-all"
                  >
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: PAYMENT */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold">Payment Details</h2>
                <p className="text-zinc-400">Enter your card details to start your subscription.</p>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-zinc-300 capitalize">{plan} Plan</span>
                    <span className="font-bold">Rs. {PLAN_PRICES[plan]}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-zinc-400">
                    <span>Billed monthly</span>
                    <span>Cancel anytime</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Card Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input 
                        type="text" 
                        placeholder="0000 0000 0000 0000"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white font-mono"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Expiry Date</label>
                      <input 
                        type="text" 
                        placeholder="MM/YY"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">CVC</label>
                      <input 
                        type="text" 
                        placeholder="123"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex justify-between">
                  <button onClick={prevStep} disabled={loading} className="px-6 py-3 rounded-full font-semibold text-zinc-400 hover:text-white transition-colors disabled:opacity-50">
                    Back
                  </button>
                  <button 
                    onClick={handlePayment}
                    disabled={loading}
                    className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2 transition-all min-w-[140px] justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Pay & Subscribe'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: SUCCESS */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold mb-4">You're all set!</h2>
                <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                  Your tenant has been created and your subscription is active. Welcome to NexPOS!
                </p>
                
                <a 
                  href="https://nexpos-demo.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-full font-semibold transition-all shadow-[0_0_30px_rgba(79,70,229,0.5)]"
                >
                  Go to POS Dashboard <ArrowRight className="w-5 h-5" />
                </a>
              </motion.div>
            )}
            
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background pt-24 pb-12 px-4 flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
