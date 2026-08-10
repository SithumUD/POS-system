"use client";

import { motion } from "framer-motion";
import { BarChart3, Cloud, Layers, MapPin, Package, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: <MapPin className="w-6 h-6" />,
    title: "Multi-Branch Management",
    description: "Manage multiple store locations from a single unified dashboard."
  },
  {
    icon: <Cloud className="w-6 h-6" />,
    title: "Offline Support",
    description: "Keep selling even when the internet goes down. Auto-syncs when back online."
  },
  {
    icon: <Package className="w-6 h-6" />,
    title: "Advanced Inventory",
    description: "Real-time stock tracking, low-stock alerts, and inter-branch transfers."
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Smart Analytics",
    description: "Deep insights into sales performance, profitability, and product margins."
  },
  {
    icon: <Layers className="w-6 h-6" />,
    title: "Role-Based Access",
    description: "Secure permissions for Admins, Managers, and Cashiers."
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Cloud Hosted & Secure",
    description: "Automated backups and bank-grade security to protect your business data."
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-black/50 relative">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Everything you need to <span className="text-gradient">succeed</span></h2>
          <p className="text-lg text-zinc-400">
            Powerful features designed to simplify operations, reduce shrinkage, and boost your bottom line.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-8 rounded-2xl hover:bg-white/[0.05] transition-colors group cursor-default"
            >
              <div className="bg-primary/20 text-primary w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
