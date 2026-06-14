"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Car, Bike, Bus, Truck } from "lucide-react";
import { useEffect } from "react";
import { useAppSelector } from "@/app/redux/hooks";
import { useRouter } from "next/navigation";

// Variants for staggered entrance
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

// Variant for the pop-up icons
const iconVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

export default function Hero() {
  const { loggedUser } = useAppSelector((store) => store.user);
  const router = useRouter();


  useEffect(() => {
    if (loggedUser?.role == "partner") {
      router.push("/partner/dashboard");
    } else if (loggedUser?.role == "admin") {
      router.push("/admin/deshboard");
    }
  }, [loggedUser?.role, router]);

  

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#020617]">
      {/* ── Background Image with Slow Zoom Animation ── */}
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: 1.1 }}
        transition={{
          duration: 30,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear",
        }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
      </motion.div>

      {/* ── Dark Gradient Overlay ── */}
      <div className="absolute inset-0 z-0 bg-linear-to-b from-[#020617]/80 via-[#020617]/85 to-[#020617] backdrop-blur-[2px]" />

      {/* ── Subtle Glow Orbs ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute w-100 h-100 rounded-full bg-blue-600/15 blur-[100px] -top-20 -left-20 animate-pulse" />
        <div className="absolute w-75 h-75 rounded-full bg-violet-600/15 blur-[100px] bottom-20 right-10 animate-pulse delay-1000" />
      </div>

      {/* ── Main Content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-24 pb-12 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl mx-auto flex flex-col items-center"
        >
          {/* Top Badge */}
          <motion.div
            variants={itemVariants}
            className="mb-6 py-1.5 px-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-lg"
          >
            <span className="font-mono text-[10px] md:text-xs font-medium tracking-widest text-blue-400 uppercase">
              The Ultimate Booking Platform
            </span>
          </motion.div>

          {/* Main Headline (Smaller Size) */}
          <motion.h1
            variants={itemVariants}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6"
          >
            Book{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-violet-400">
              Any
            </span>{" "}
            Vehicle. <br className="hidden md:block" />
            Anytime. Anywhere.
          </motion.h1>

          {/* Subheading Text (Smaller Size) */}
          <motion.p
            variants={itemVariants}
            className="text-base md:text-lg text-slate-300 mb-10 max-w-xl leading-relaxed"
          >
            From quick city rides to heavy cargo transport, NextRide is your
            all-in-one platform for real-time tracking and seamless bookings.
          </motion.p>

          {/* Call to Action Button */}
          <motion.div variants={itemVariants} className="mb-16">
            <Link
              href="/user/book"
              className="group relative inline-flex items-center justify-center gap-2 py-3.5 px-8 rounded-full text-sm md:text-base font-semibold text-[#020617] bg-white hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all duration-300 hover:-translate-y-1"
            >
              Start Booking Now
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </motion.div>

          {/* ── Vehicle Icons Showcase ── */}
          <motion.div
            variants={itemVariants}
            className="w-full border-t border-white/10 pt-10"
          >
            <p className="font-mono text-[10px] text-slate-400 uppercase tracking-widest mb-8">
              Our Fleet Supports
            </p>

            <motion.div
              variants={containerVariants} // Stagger for icons
              className="flex flex-wrap items-center justify-center gap-6 md:gap-12"
            >
              {/* Bike */}
              <motion.div
                variants={iconVariants}
                className="flex flex-col items-center gap-3 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-xl flex items-center justify-center border border-white/10 shadow-lg group-hover:border-blue-500/50 group-hover:bg-blue-500/10 transition-all duration-300 relative overflow-hidden">
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Bike className="w-7 h-7 text-slate-300 group-hover:text-blue-400 transition-colors" />
                  </motion.div>
                </div>
                <span className="text-[11px] font-medium text-slate-400 group-hover:text-white transition-colors uppercase tracking-wider">
                  Bikes
                </span>
              </motion.div>

              {/* Car */}
              <motion.div
                variants={iconVariants}
                className="flex flex-col items-center gap-3 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-xl flex items-center justify-center border border-white/10 shadow-lg group-hover:border-violet-500/50 group-hover:bg-violet-500/10 transition-all duration-300 relative overflow-hidden">
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.2,
                    }}
                  >
                    <Car className="w-7 h-7 text-slate-300 group-hover:text-violet-400 transition-colors" />
                  </motion.div>
                </div>
                <span className="text-[11px] font-medium text-slate-400 group-hover:text-white transition-colors uppercase tracking-wider">
                  Cars
                </span>
              </motion.div>

              {/* Bus */}
              <motion.div
                variants={iconVariants}
                className="flex flex-col items-center gap-3 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-xl flex items-center justify-center border border-white/10 shadow-lg group-hover:border-blue-500/50 group-hover:bg-blue-500/10 transition-all duration-300 relative overflow-hidden">
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                      duration: 3.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.4,
                    }}
                  >
                    <Bus className="w-7 h-7 text-slate-300 group-hover:text-blue-400 transition-colors" />
                  </motion.div>
                </div>
                <span className="text-[11px] font-medium text-slate-400 group-hover:text-white transition-colors uppercase tracking-wider">
                  Buses
                </span>
              </motion.div>

              {/* Truck */}
              <motion.div
                variants={iconVariants}
                className="flex flex-col items-center gap-3 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-xl flex items-center justify-center border border-white/10 shadow-lg group-hover:border-violet-500/50 group-hover:bg-violet-500/10 transition-all duration-300 relative overflow-hidden">
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                      duration: 3.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.1,
                    }}
                  >
                    <Truck className="w-7 h-7 text-slate-300 group-hover:text-violet-400 transition-colors" />
                  </motion.div>
                </div>
                <span className="text-[11px] font-medium text-slate-400 group-hover:text-white transition-colors uppercase tracking-wider">
                  Trucks
                </span>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
