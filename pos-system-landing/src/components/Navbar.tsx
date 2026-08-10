import Link from "next/link";
import { Store } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-white/10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="NexPOS Logo" className="h-8 object-contain" />
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/#features" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Features
          </Link>
          <Link href="/#how-it-works" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            How It Works
          </Link>
          <Link href="/#pricing" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Pricing
          </Link>
          <Link href="/#contact" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <a 
            href="https://nexpos-demo.netlify.app/" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-zinc-300 hover:text-white transition-colors hidden sm:block"
          >
            Live Demo / Login
          </a>
          <Link 
            href="/#contact" 
            className="text-sm font-medium bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-full transition-all shadow-[0_0_15px_rgba(79,70,229,0.5)]"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
