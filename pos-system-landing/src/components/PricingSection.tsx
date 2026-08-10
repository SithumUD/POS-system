"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "STARTER",
    price: "4,500",
    description: "For small shops and single-location businesses.",
    limits: ["1 branch", "1 POS terminal", "Up to 3 users", "Up to 5,000 products"],
    features: ["POS & Billing", "Inventory Management", "Offline POS sync", "Basic Reports", "Role-based permissions"],
    popular: false,
    cta: "Start Starter"
  },
  {
    name: "BUSINESS",
    price: "7,500",
    description: "For growing businesses with more users or multiple branches.",
    limits: ["Up to 3 branches", "Up to 5 POS terminals", "Up to 15 users", "Up to 25,000 products"],
    features: ["Everything in Starter", "Inter-branch transfers", "Purchase Orders", "Profit & Loss Reports", "Mobile scanner"],
    popular: true,
    cta: "Start Business"
  },
  {
    name: "PROFESSIONAL",
    price: "12,500",
    description: "For established retail businesses and small chains.",
    limits: ["Up to 10 branches", "Up to 20 POS terminals", "Up to 50 users", "Unlimited products"],
    features: ["Everything in Business", "Consolidated Dashboard", "Anomaly/Fraud Alerts", "Ask Your Data Analytics", "Priority Support"],
    popular: false,
    cta: "Start Professional"
  },
  {
    name: "ENTERPRISE",
    price: "Custom",
    description: "For larger companies and retail chains.",
    limits: ["Unlimited branches", "Unlimited POS terminals", "Unlimited users", "Unlimited products"],
    features: ["Dedicated infrastructure", "Custom domain & branding", "API integrations", "Custom reports", "SLA options"],
    popular: false,
    cta: "Contact Sales"
  }
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Simple, transparent <span className="text-gradient">pricing</span></h2>
          <p className="text-lg text-zinc-400">
            Choose the plan that best fits your business size and needs. Upgrade as you grow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`glass-card p-8 rounded-3xl relative flex flex-col ${plan.popular ? 'border-primary ring-1 ring-primary shadow-[0_0_30px_rgba(79,70,229,0.2)]' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-zinc-400 text-sm h-10">{plan.description}</p>
              </div>
              
              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-semibold text-zinc-400">Rs.</span>
                  <span className="text-5xl font-bold">{plan.price}</span>
                </div>
                {plan.price !== "Custom" && <span className="text-zinc-500 text-sm">/ month</span>}
              </div>

              <Link
                href="#contact"
                className={`w-full py-3 rounded-full font-semibold transition-all mb-8 flex justify-center ${plan.popular ? 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/25' : 'bg-white/10 hover:bg-white/20 text-white'}`}
              >
                {plan.cta}
              </Link>

              <div className="flex-1">
                <p className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Limits</p>
                <ul className="space-y-3 mb-8">
                  {plan.limits.map((limit, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                      <div className="mt-0.5 rounded-full bg-primary/20 p-0.5 flex-shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span>{limit}</span>
                    </li>
                  ))}
                </ul>

                <p className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Key Features</p>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                      <div className="mt-0.5 rounded-full bg-white/10 p-0.5 flex-shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
