"use client";

import Link from "next/link";
import {
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Zap,
  Navigation,
} from "lucide-react";
import { useAppSelector } from "@/app/redux/hooks";

export default function Footer() {
  const { loggedUser } = useAppSelector((store) => store.user);
  
  const isAdmin = loggedUser?.role === 'admin';
  const isUser = loggedUser?.role === 'user';
  const isPartner = loggedUser?.role === 'partner';

  return (
    <footer className="bg-[#020617] border-t border-white/5 pt-16 pb-8 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[150%] h-50 bg-blue-600/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-16">
          
          {/* ── Brand & "Why Us" Description ── */}
          <div className="md:col-span-5">
            {/* CSS-Only Logo */}
            <Link href="/" className="flex items-center gap-3 mb-6 w-fit">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-b from-slate-800 to-[#020617] border border-slate-700/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                <div className="absolute w-1 h-3.5 bg-blue-500 rounded-full left-2 translate-y-px" />
                <div className="absolute w-1 h-3.5 bg-violet-500 rounded-full right-2 -translate-y-px" />
                <div className="absolute w-1 h-4 bg-blue-400 rotate-45 rounded-full" />
              </div>
              <div className="font-display text-xl tracking-tight flex items-center">
                <span className="font-extrabold text-white">Next</span>
                <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
                  Ride
                </span>
              </div>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm mb-6">
              NextRide isn&lsquo;t just another booking app—it&lsquo;s a
              revolution in daily transit. We guarantee zero hidden surges,
              completely verified partners, and an experience that values your
              time.
            </p>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-medium tracking-wide uppercase">
                Fastest Matches
              </span>
              <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-medium tracking-wide uppercase">
                100% Secure
              </span>
            </div>
          </div>

          {/* ── Why We Are Better ── */}
          <div className="md:col-span-4">
            <h4 className="text-white font-semibold mb-6 tracking-wide">
              The NextRide Advantage
            </h4>
            <ul className="space-y-5">
              <li className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    Lightning Fast Booking
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Say goodbye to long waits. Our smart routing connects you
                    instantly.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    Uncompromised Safety
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Every driver undergoes strict Video KYC. Your safety is our
                    priority.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Navigation className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    Pinpoint Live Tracking
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Watch your ride arrive with extreme, real-time map
                    precision.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* ── Contact Info ── */}
          <div className="md:col-span-3">
            <h4 className="text-white font-semibold mb-6 tracking-wide">
              Contact Us
            </h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-blue-400" />
                <a href="mailto:bhuvankumar66666@gmail.com" className="text-sm">
                  bhuvankumar66666@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-emerald-400" />
                <a href="tel:+919389619722" className="text-sm">
                  +91 9389619722
                </a>
              </li>
              
              {/* Conditional Rendering: Show GitHub link to User or Partner */}
              {(isUser || isPartner) && (
                <li className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 text-slate-300"
                  >
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    <path d="M9 18c-4.51 2-5-2-7-2" />
                  </svg>
                  <a 
                    href="https://github.com/Bhuvankumar32085" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm"
                  >
                    Bhuvankumar32085
                  </a>
                </li>
              )}

              <li className="flex items-start gap-3 text-slate-400 mt-2">
                <MapPin className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <span className="text-sm leading-relaxed">
                  Siau, Chandpur,<br />
                  Bijnor (UP), India
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5">
          <p className="text-xs text-slate-500 mb-4 md:mb-0">
            © {new Date().getFullYear()} NextRide. Redefining everyday travel.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono text-emerald-500/70 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}