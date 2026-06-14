"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/app/redux/hooks";
import { useRouter } from "next/navigation";
import { bookingApi } from "@/app/axios/bookingApi";
import axios from "axios";
import { motion, Variants } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  Activity,
  CalendarDays,
  Banknote,
  Users,
  Trophy,
  AlertOctagon,
  Car,
  XCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  TrendingDown,
  Layers,
} from "lucide-react";
import Image from "next/image";

// --- TypeScript Interfaces based on exact API Response ---
interface DashboardSummary {
  totalRevenue: number;
  todayRevenue: number;
  last7DaysRevenue: number;
  totalFareCollected: number;
  totalPartnerPayout: number;
  totalCompletedRides: number;
  totalCancelledRides: number;
  cancelledByUser: number;
  cancelledByPartner: number;
}

interface PartnerProfile {
  _id: string;
  name: string;
  email: string;
  image?: string;
  mobileNumber?: string;
}

interface PartnerStat {
  partner: PartnerProfile;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  completionRate: number;
  cancellationRate: number;
}

interface RecentEarning {
  _id: string;
  userId: string;
  driverId: string;
  totalFare: number;
  adminCommission: number;
  partnerAmount: number;
  paymentMethod: "online" | "cod";
  updatedAt: string;
}

interface DashboardData {
  summary: DashboardSummary;
  topCompletedPartner: PartnerStat | null;
  topCancelledPartner: PartnerStat | null;
  recentEarnings: RecentEarning[];
}

// --- Framer Motion Variants ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const bentoItemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 14 },
  },
};

const Page = () => {
  const router = useRouter();
  const { loggedUser } = useAppSelector((store) => store.user);

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );

  useEffect(() => {
    if (!loggedUser) return;

    if (loggedUser.role !== "admin") {
      router.replace("/");
      return;
    }

    fetchDashboard();
  }, [loggedUser]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const { data } = await bookingApi.get("/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error.response?.data);
      }
    } finally {
      setLoading(false);
    }
  };

  // Safe Formatters
  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!loggedUser) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
        <p className="text-indigo-400 font-mono text-xs tracking-[0.3em] animate-pulse">
          SYSTEM BOOTING...
        </p>
      </div>
    );
  }

  if (loggedUser.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans relative overflow-x-hidden selection:bg-indigo-500/30 pb-24">
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-[700px] w-[700px] rounded-full bg-indigo-600/10 blur-[180px]" />
        <div className="absolute top-[20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-cyan-500/10 blur-[160px]" />
        <div className="absolute bottom-[-10%] left-[20%] h-[800px] w-[800px] rounded-full bg-violet-600/5 blur-[200px]" />
      </div>

      {/* Custom Table Scrollbar */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .ledger-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
        .ledger-scroll::-webkit-scrollbar-track { background: transparent; }
        .ledger-scroll::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.3); border-radius: 10px; }
        .ledger-scroll::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.5); }
      `,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-10">
        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black tracking-widest uppercase font-mono mb-3">
              <ShieldCheck size={12} /> Root Access Granted
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white">
              Revenue{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                Intelligence
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-2 font-medium tracking-wide">
              Macro-level financial telemetry and operational node data.
            </p>
          </div>

          <div className="px-5 py-3 rounded-2xl bg-white/[0.01] border border-white/5 backdrop-blur-xl flex items-center gap-3 shrink-0 shadow-lg">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black font-mono tracking-widest text-slate-500 uppercase">
                Status
              </span>
              <span className="text-xs font-bold text-slate-200">
                System Live
              </span>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Layers
              size={40}
              className="text-indigo-500 animate-bounce shadow-indigo-500/50 drop-shadow-xl"
            />
            <p className="text-slate-500 font-mono tracking-widest text-xs uppercase animate-pulse">
              Aggregating Ledgers...
            </p>
          </div>
        ) : dashboardData ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-12 gap-5"
          >
            {/* ── BENTO BLOCK 1: CORE REVENUE (Spans 8 cols) ── */}
            <motion.div
              variants={bentoItemVariants}
              className="md:col-span-12 lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5"
            >
              {/* Grand Total Card */}
              <div className="sm:col-span-2 rounded-[32px] border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 via-slate-900/80 to-slate-900/40 p-6 sm:p-8 relative overflow-hidden backdrop-blur-xl shadow-[0_15px_40px_rgba(79,70,229,0.1)] group">
                <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:opacity-20 transition-opacity duration-700 transform group-hover:scale-110">
                  <Wallet size={180} />
                </div>
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <span className="text-[11px] font-black tracking-widest text-indigo-400 uppercase font-mono flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
                      <Wallet size={14} className="text-indigo-300" />
                    </div>
                    Total Admin Commission
                  </span>
                  <div className="mt-8">
                    <h2 className="text-5xl sm:text-6xl font-black font-mono text-white tracking-tighter drop-shadow-2xl">
                      {formatCurrency(dashboardData.summary.totalRevenue)}
                    </h2>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-black tracking-widest font-mono border border-emerald-500/20">
                        + NET
                      </span>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Platform earnings from all completed rides since
                        genesis.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Today's Velocity */}
              <div className="rounded-[28px] border border-white/5 bg-slate-900/60 p-6 backdrop-blur-xl hover:bg-slate-900/80 transition-colors relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors" />
                <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase font-mono flex items-center gap-1.5 relative z-10">
                  <Activity size={14} /> Today&apos;s Revenue
                </span>
                <h3 className="text-3xl font-black font-mono text-white mt-4 tracking-tight relative z-10">
                  {formatCurrency(dashboardData.summary.todayRevenue)}
                </h3>
                <p className="text-[10px] text-slate-500 mt-2 font-medium relative z-10">
                  Commission generated today.
                </p>
              </div>

              {/* 7 Days Trend */}
              <div className="rounded-[28px] border border-white/5 bg-slate-900/60 p-6 backdrop-blur-xl hover:bg-slate-900/80 transition-colors relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl group-hover:bg-violet-500/10 transition-colors" />
                <span className="text-[10px] font-black tracking-widest text-violet-400 uppercase font-mono flex items-center gap-1.5 relative z-10">
                  <CalendarDays size={14} /> Last 7 Days
                </span>
                <h3 className="text-3xl font-black font-mono text-white mt-4 tracking-tight relative z-10">
                  {formatCurrency(dashboardData.summary.last7DaysRevenue)}
                </h3>
                <p className="text-[10px] text-slate-500 mt-2 font-medium relative z-10">
                  Rolling weekly revenue generation.
                </p>
              </div>
            </motion.div>

            {/* ── BENTO BLOCK 2: FLOW METRICS (Spans 4 cols) ── */}
            <motion.div
              variants={bentoItemVariants}
              className="md:col-span-12 lg:col-span-4 flex flex-col gap-5"
            >
              <div className="flex-1 rounded-[28px] border border-white/5 bg-slate-900/60 p-6 backdrop-blur-xl flex flex-col justify-center relative overflow-hidden group">
                <div className="absolute bottom-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Banknote size={80} />
                </div>
                <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase font-mono flex items-center gap-1.5 relative z-10">
                  <Banknote size={14} /> Gross Network Fare
                </span>
                <h3 className="text-3xl sm:text-4xl font-black font-mono text-white mt-3 tracking-tight relative z-10">
                  {formatCurrency(dashboardData.summary.totalFareCollected)}
                </h3>
                <p className="text-[10px] text-slate-500 mt-2 relative z-10">
                  Total money paid by users into the platform.
                </p>
              </div>

              <div className="flex-1 rounded-[28px] border border-white/5 bg-slate-900/60 p-6 backdrop-blur-xl flex flex-col justify-center relative overflow-hidden group">
                <div className="absolute bottom-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Users size={80} />
                </div>
                <span className="text-[10px] font-black tracking-widest text-orange-400 uppercase font-mono flex items-center gap-1.5 relative z-10">
                  <Users size={14} /> Partner Payouts
                </span>
                <h3 className="text-3xl sm:text-4xl font-black font-mono text-white mt-3 tracking-tight relative z-10">
                  {formatCurrency(dashboardData.summary.totalPartnerPayout)}
                </h3>
                <p className="text-[10px] text-slate-500 mt-2 relative z-10">
                  Capital distributed to driver wallets.
                </p>
              </div>
            </motion.div>

            {/* ── BENTO BLOCK 3: OPERATIONAL LOGISTICS (Spans 12 cols) ── */}
            <motion.div
              variants={bentoItemVariants}
              className="md:col-span-12 rounded-[32px] border border-white/5 bg-slate-900/40 p-6 sm:p-8 backdrop-blur-xl"
            >
              <div className="flex flex-col md:flex-row gap-8">
                {/* Global Ride Stats */}
                <div className="w-full md:w-1/3 flex flex-col justify-center space-y-4 pr-0 md:pr-8 md:border-r border-white/5">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono flex items-center gap-2 mb-2">
                    <Car size={14} className="text-blue-500" /> Ride Operations
                  </h3>

                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-500" />{" "}
                      Completed
                    </span>
                    <span className="text-xl font-black font-mono text-emerald-400">
                      {dashboardData.summary.totalCompletedRides}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                      <XCircle size={16} className="text-red-500" /> Cancelled
                    </span>
                    <span className="text-xl font-black font-mono text-red-400">
                      {dashboardData.summary.totalCancelledRides}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                      <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest font-mono">
                        By User
                      </span>
                      <span className="block text-base font-black font-mono text-slate-300 mt-0.5">
                        {dashboardData.summary.cancelledByUser}
                      </span>
                    </div>
                    <div className="flex-1 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                      <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest font-mono">
                        By Partner
                      </span>
                      <span className="block text-base font-black font-mono text-slate-300 mt-0.5">
                        {dashboardData.summary.cancelledByPartner}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Performance Nodes (Top / Bottom Partners) */}
                <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Top Partner */}
                  <div className="rounded-[24px] bg-emerald-500/5 border border-emerald-500/20 p-5 relative overflow-hidden group">
                    <div className="absolute -bottom-6 -right-6 opacity-10 text-emerald-500 group-hover:scale-110 transition-transform">
                      <Trophy size={100} />
                    </div>
                    <span className="inline-block px-2.5 py-1 mb-4 rounded-md bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest font-mono relative z-10">
                      Top Node
                    </span>

                    {dashboardData.topCompletedPartner?.partner ? (
                      <div className="relative z-10">
                        <div className="flex items-center gap-3">
                          {/* Safe Image Rendering */}
                          {dashboardData.topCompletedPartner.partner.image ? (
                            <Image
                              src={
                                dashboardData.topCompletedPartner.partner.image
                              }
                              alt="Partner"
                              width={56}
                              height={56}
                              className="w-12 h-12 rounded-xl border border-emerald-500/30 object-cover shadow-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl border border-emerald-500/30 bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-xl uppercase shadow-lg">
                              {dashboardData.topCompletedPartner.partner.name?.charAt(
                                0,
                              ) || "P"}
                            </div>
                          )}

                          <div>
                            <h4 className="font-bold text-white text-sm tracking-tight truncate max-w-[140px]">
                              {dashboardData.topCompletedPartner.partner.name ||
                                "Unknown"}
                            </h4>
                            <p className="text-[9px] text-slate-400 font-mono truncate max-w-[140px]">
                              {dashboardData.topCompletedPartner.partner
                                .email || "No Email"}
                            </p>
                          </div>
                        </div>
                        <div className="mt-5 flex items-end justify-between border-t border-emerald-500/10 pt-4">
                          <div>
                            <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest font-mono">
                              Volume
                            </p>
                            <p className="text-xl font-black font-mono text-emerald-400 mt-0.5">
                              {
                                dashboardData.topCompletedPartner
                                  .completedBookings
                              }
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest font-mono">
                              Success Rate
                            </p>
                            <p className="text-lg font-black font-mono text-white mt-0.5">
                              {dashboardData.topCompletedPartner.completionRate}
                              %
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">
                        Insufficient node data.
                      </p>
                    )}
                  </div>

                  {/* Worst Partner */}
                  <div className="rounded-[24px] bg-rose-500/5 border border-rose-500/20 p-5 relative overflow-hidden group">
                    <div className="absolute -bottom-6 -right-6 opacity-10 text-rose-500 group-hover:scale-110 transition-transform">
                      <AlertOctagon size={100} />
                    </div>
                    <span className="inline-block px-2.5 py-1 mb-4 rounded-md bg-rose-500/20 text-rose-400 text-[9px] font-black uppercase tracking-widest font-mono relative z-10">
                      Risk Node
                    </span>

                    {dashboardData.topCancelledPartner?.partner ? (
                      <div className="relative z-10">
                        <div className="flex items-center gap-3">
                          {/* Safe Image Rendering with Grayscale */}
                          {dashboardData.topCancelledPartner.partner.image ? (
                            <Image
                              src={
                                dashboardData.topCancelledPartner.partner.image
                              }
                              alt="Partner"
                              width={56}
                              height={56}
                              className="w-12 h-12 rounded-xl border border-rose-500/30 object-cover shadow-lg grayscale"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl border border-rose-500/30 bg-rose-500/20 flex items-center justify-center text-rose-400 font-black text-xl uppercase shadow-lg grayscale">
                              {dashboardData.topCancelledPartner.partner.name?.charAt(
                                0,
                              ) || "P"}
                            </div>
                          )}

                          <div>
                            <h4 className="font-bold text-white text-sm tracking-tight truncate max-w-[140px]">
                              {dashboardData.topCancelledPartner.partner.name ||
                                "Unknown"}
                            </h4>
                            <p className="text-[9px] text-slate-400 font-mono truncate max-w-[140px]">
                              {dashboardData.topCancelledPartner.partner
                                .email || "No Email"}
                            </p>
                          </div>
                        </div>
                        <div className="mt-5 flex items-end justify-between border-t border-rose-500/10 pt-4">
                          <div>
                            <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest font-mono">
                              Dropped
                            </p>
                            <p className="text-xl font-black font-mono text-rose-400 mt-0.5">
                              {
                                dashboardData.topCancelledPartner
                                  .cancelledBookings
                              }
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest font-mono">
                              Drop Rate
                            </p>
                            <div className="flex items-center justify-end gap-1 mt-0.5">
                              <TrendingDown
                                size={12}
                                className="text-rose-500"
                              />
                              <p className="text-lg font-black font-mono text-white">
                                {
                                  dashboardData.topCancelledPartner
                                    .cancellationRate
                                }
                                %
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">
                        Insufficient node data.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── BENTO BLOCK 4: RECENT EARNINGS LEDGER ── */}
            <motion.div
              variants={bentoItemVariants}
              className="md:col-span-12 mt-4 rounded-[32px] border border-white/5 bg-slate-900/60 backdrop-blur-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative"
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="p-6 md:p-8 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 bg-black/10">
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Activity size={20} className="text-indigo-400" /> Live
                    Settlement Ledger
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1.5 font-medium tracking-wide">
                    Monitoring the latest 20 confirmed transaction logs.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto relative z-10 ledger-scroll">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 font-mono">
                      <th className="p-4 pl-6 md:pl-8 whitespace-nowrap">
                        Ref Node ID
                      </th>
                      <th className="p-4 whitespace-nowrap">Gross Extracted</th>
                      <th className="p-4 whitespace-nowrap text-indigo-400">
                        Platform Cut
                      </th>
                      <th className="p-4 whitespace-nowrap">Node Payout</th>
                      <th className="p-4 whitespace-nowrap">Ledger Route</th>
                      <th className="p-4 pr-6 md:pr-8 whitespace-nowrap text-right">
                        Timestamp Log
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-xs sm:text-sm divide-y divide-white/5">
                    {dashboardData.recentEarnings &&
                    dashboardData.recentEarnings.length > 0 ? (
                      dashboardData.recentEarnings.map((earning) => (
                        <tr
                          key={earning._id}
                          className="hover:bg-white/[0.03] transition-colors group"
                        >
                          <td className="p-4 pl-6 md:pl-8 font-mono text-slate-400 font-medium">
                            <span className="text-slate-600">#</span>
                            {earning._id.slice(-8).toUpperCase()}
                          </td>
                          <td className="p-4 font-mono font-bold text-slate-200">
                            {formatCurrency(earning.totalFare)}
                          </td>
                          <td className="p-4 font-mono font-black text-indigo-400 bg-indigo-500/[0.02]">
                            +{formatCurrency(earning.adminCommission)}
                          </td>
                          <td className="p-4 font-mono font-medium text-slate-400">
                            {formatCurrency(earning.partnerAmount)}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest font-mono border ${
                                earning.paymentMethod === "online"
                                  ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                                  : "bg-orange-500/10 border-orange-500/20 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.1)]"
                              }`}
                            >
                              {earning.paymentMethod || "UNKNOWN"}
                            </span>
                          </td>
                          <td className="p-4 pr-6 md:pr-8 text-slate-500 font-mono text-[10px] text-right font-medium tracking-wide">
                            {formatDate(earning.updatedAt)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-10 text-center text-slate-500 font-medium text-sm"
                        >
                          No recent transactions found in the global ledger
                          block.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};

export default Page;
