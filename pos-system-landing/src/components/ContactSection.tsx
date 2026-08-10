"use client";

import { motion } from "framer-motion";
import { Mail, Phone, ExternalLink } from "lucide-react";

export function ContactSection() {
  return (
    <section id="contact" className="py-24 relative overflow-hidden bg-white/5 border-t border-white/10">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to <span className="text-gradient">Get Started?</span></h2>
          <p className="text-lg text-zinc-400">
            Contact us today to setup your account. We'll guide you through the process and get you up and running in no time.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center gap-8 max-w-4xl mx-auto">
          <motion.a 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            href="mailto:sithumudayangaofficial@gmail.com"
            className="glass-card flex items-center gap-4 p-6 rounded-2xl hover:bg-white/10 transition-colors w-full md:w-auto flex-1 group"
          >
            <div className="bg-primary/20 p-4 rounded-full text-primary">
              <Mail className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-zinc-400 font-semibold mb-1">Email Us</p>
              <p className="text-white font-medium text-lg">sithumudayangaofficial@gmail.com</p>
            </div>
            <ExternalLink className="w-5 h-5 text-zinc-600 group-hover:text-primary transition-colors" />
          </motion.a>

          <motion.a 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            href="https://wa.me/94702575370"
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card flex items-center gap-4 p-6 rounded-2xl hover:bg-white/10 transition-colors w-full md:w-auto flex-1 group"
          >
            <div className="bg-emerald-500/20 p-4 rounded-full text-emerald-400">
              <Phone className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-zinc-400 font-semibold mb-1">WhatsApp Us</p>
              <p className="text-white font-medium text-lg">+94 70 257 5370</p>
            </div>
            <ExternalLink className="w-5 h-5 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
          </motion.a>
        </div>
      </div>
    </section>
  );
}
