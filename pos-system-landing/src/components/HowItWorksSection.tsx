"use client";

import { motion } from "framer-motion";
import { MessageSquare, Mail, CreditCard, Play } from "lucide-react";

const steps = [
  {
    icon: <MessageSquare className="w-8 h-8 text-primary" />,
    title: "1. Contact Us",
    description: "Reach out via Email or WhatsApp to tell us about your business and choose a plan."
  },
  {
    icon: <Mail className="w-8 h-8 text-primary" />,
    title: "2. Receive Invitation",
    description: "We will send you a secure signup link to register your business details and admin account."
  },
  {
    icon: <CreditCard className="w-8 h-8 text-primary" />,
    title: "3. Make Payment",
    description: "Complete your subscription payment manually and send the receipt to our WhatsApp."
  },
  {
    icon: <Play className="w-8 h-8 text-primary" />,
    title: "4. Get Activated",
    description: "Once verified, we approve your account and you can start using NexPOS immediately."
  }
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">How It <span className="text-gradient">Works</span></h2>
          <p className="text-lg text-zinc-400">
            Getting started with NexPOS is simple and personalized to your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-8 rounded-3xl relative flex flex-col text-center items-center"
            >
              <div className="bg-primary/10 p-4 rounded-full mb-6 inline-block">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-zinc-400 text-sm">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
