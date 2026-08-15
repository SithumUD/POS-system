"use client";

import { motion } from "framer-motion";
import { Check, MapPin, GraduationCap, Settings, ShieldCheck, Cpu } from "lucide-react";
import Link from "next/link";

export function PricingSection() {
  const softwareFeatures = [
    "Lifetime POS System License",
    "Multi-Branch Store Management",
    "Offline Billing with Auto-Sync",
    "Real-time Inventory & Stock Tracking",
    "Sales, Profit & Loss Analytics",
    "Secure Role-Based Staff Accounts",
    "Anomaly & Fraud Detection Alerts",
  ];

  return (
    <section id="pricing" className="py-24 relative overflow-hidden bg-black/40">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Simple, transparent <span className="text-gradient">pricing</span>
          </h2>
          <p className="text-lg text-zinc-400">
            One-time software purchase with lifetime access. No monthly subscription fees.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Software License Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card p-8 md:p-10 rounded-3xl relative flex flex-col border border-primary ring-1 ring-primary/30 shadow-[0_0_50px_rgba(79,70,229,0.15)] bg-white/[0.02]"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide shadow-md">
              Software Package
            </div>
            
            <div className="mb-6 mt-2">
              <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-primary" />
                Perpetual License
              </h3>
              <p className="text-zinc-400 text-sm">
                Get full access to our state-of-the-art POS software with lifetime updates.
              </p>
            </div>
            
            <div className="mb-8 p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-semibold text-zinc-400">Rs.</span>
                <span className="text-5xl font-black text-white tracking-tight">50,000</span>
              </div>
              <span className="text-primary font-medium text-sm mt-1 block">One-time payment • Lifetime access</span>
            </div>

            <Link
              href="#contact"
              className="w-full py-4 rounded-full font-semibold transition-all mb-8 flex justify-center bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/25 text-center"
            >
              Get the System
            </Link>

            <div className="flex-1">
              <p className="text-xs font-semibold text-zinc-300 mb-4 uppercase tracking-wider">What's Included</p>
              <ul className="space-y-3.5">
                {softwareFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3.5 text-sm text-zinc-300">
                    <div className="mt-0.5 rounded-full bg-primary/20 p-0.5 flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Deployment & Setup Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card p-8 md:p-10 rounded-3xl relative flex flex-col border border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
          >
            <div className="mb-6 mt-2">
              <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Cpu className="w-6 h-6 text-secondary" />
                Deployment & Services
              </h3>
              <p className="text-zinc-400 text-sm">
                Professional setup, training, and custom tailoring for your physical stores.
              </p>
            </div>
            
            <div className="mb-8 p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-white">Setup & Support</span>
              </div>
              <span className="text-zinc-500 text-sm mt-1 block">Tailored deployment cost based on scale</span>
            </div>

            <Link
              href="#contact"
              className="w-full py-4 rounded-full font-semibold transition-all mb-8 flex justify-center bg-white/10 hover:bg-white/20 text-white text-center"
            >
              Request Custom Quote
            </Link>

            <div className="flex-1 space-y-6">
              <p className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Service Details</p>
              
              <div className="flex gap-4">
                <div className="bg-blue-500/10 text-blue-400 p-2.5 h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">Scale-Based Deployment</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Deployment cost is separate and depends on your business scale, number of branches, and devices.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-primary/10 text-primary p-2.5 h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 border border-primary/20">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">On-Site Setup</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    We will visit your shop / business location to set up, configure, and deploy the system for you.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-emerald-500/10 text-emerald-400 p-2.5 h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">Staff Training Included</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Simple, easy-to-follow training included for you and your staff — no technical knowledge needed.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-amber-500/10 text-amber-400 p-2.5 h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 border border-amber-500/20">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">Customization Available</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Customization available to match your business needs. (Major customizations may affect the price — contact us for a quote.)
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

