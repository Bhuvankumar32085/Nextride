"use client";

import { useAppSelector } from "@/app/redux/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Car,
  Activity,
  ShieldAlert,
  Video,
  FileText,
} from "lucide-react";
import { rideApi } from "@/app/axios/rideApi";
import axios from "axios";
import toast from "react-hot-toast";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PlaceholderComponent } from "./PlaceholderComponent";
import { PendingVideoKyc } from "./PendingVideoKyc";
import PendingVehicleReview from "./PendingVehicleReview";

// ── TypeScript Interfaces ──
export interface IPendingPartner {
  _id: string;
  name: string;
  email: string;
  image?: string;
  vehicleType: string;
}

export interface IDashboardData {
  totalPartners: number;
  approvedPartners: number;
  pendingPartners: number;
  rejectedPartners: number;
  pendingPartner: IPendingPartner[];
}

export const AdminDashboard = () => {
  const { loggedUser } = useAppSelector((state) => state.user);
  const router = useRouter();

  const [data, setData] = useState<IDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Tab Management State ──
  const [activeTab, setActiveTab] = useState("overview");

  // Protect Admin Route
  useEffect(() => {
    if (loggedUser === undefined) return;
    if (loggedUser?.role !== "admin") {
      router.push("/");
    }
  }, [loggedUser, router]);

  // Fetch Dashboard Data
  useEffect(() => {
    const fetchAdminDashboardData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await rideApi.get("/admin-deshboard--details", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.message || "Failed to fetch data.");
        } else {
          toast.error("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDashboardData();
  }, []);

  if (!loggedUser || loggedUser.role !== "admin") return null;

  // ── Computations ──
  const activePendingCount =
    data?.pendingPartner?.length || data?.pendingPartners || 0;

  const chartData = [
    { name: "Approved", value: data?.approvedPartners || 0, color: "#10b981" }, // Emerald
    { name: "Pending", value: activePendingCount, color: "#f59e0b" }, // Amber
    { name: "Rejected", value: data?.rejectedPartners || 0, color: "#f43f5e" }, // Rose
  ];

  // ── Navigation Tabs Configuration ──
  const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "partner-reviews", label: "Pending Partner Reviews", icon: FileText },
    { id: "video-kyc", label: "Pending Video KYC", icon: Video },
    { id: "vehicle-reviews", label: "Pending Vehicle Reviews", icon: Car },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 font-sans relative min-h-screen">
      {/* ── Subtle Background Glow ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] max-w-3xl h-[300px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* ── Header Section ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 md:mb-10"
      >
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-mono font-medium text-blue-400 uppercase tracking-widest">
            Admin Workspace
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Overview
        </h1>
        <p className="text-sm md:text-base text-slate-400 mt-2 max-w-xl">
          Manage partner verifications, track fleet distribution, and monitor
          overall platform health in real-time.
        </p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center h-[50vh]">
          <div className="w-10 h-10 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6 md:space-y-8">
          {/* ── Stats Grid ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-5 hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-xs md:text-sm font-medium text-slate-400">
                  Total Partners
                </h3>
              </div>
              <p className="text-3xl md:text-4xl font-bold text-white">
                {data?.totalPartners || 0}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-5 hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-xs md:text-sm font-medium text-slate-400">
                  Approved
                </h3>
              </div>
              <p className="text-3xl md:text-4xl font-bold text-white">
                {data?.approvedPartners || 0}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-2xl p-5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Clock className="w-16 h-16 text-amber-500" />
              </div>
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 animate-pulse">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-xs md:text-sm font-medium text-amber-500/80">
                  Pending Review
                </h3>
              </div>
              <p className="text-3xl md:text-4xl font-bold text-amber-400 relative z-10">
                {activePendingCount}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-5 hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                  <XCircle className="w-5 h-5" />
                </div>
                <h3 className="text-xs md:text-sm font-medium text-slate-400">
                  Rejected
                </h3>
              </div>
              <p className="text-3xl md:text-4xl font-bold text-white">
                {data?.rejectedPartners || 0}
              </p>
            </motion.div>
          </div>

          {/* ── Interactive Tabs Navigation ── */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mt-4 [&::-webkit-scrollbar]:hidden border-b border-white/5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all whitespace-nowrap border-b-2 ${
                    isActive
                      ? "border-blue-500 text-blue-400 bg-blue-500/5"
                      : "border-transparent text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-500"}`}
                  />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ── Dynamic Content Rendering Area ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {/* 1. OVERVIEW VIEW */}
              {activeTab === "overview" && (
                <div className="grid lg:grid-cols-3 gap-6 md:gap-8 mt-2">
                  {/* Verification Queue List */}
                  <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-5 md:p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                          <Activity className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h2 className="text-lg md:text-xl font-bold text-white">
                            General Queue
                          </h2>
                          <p className="text-xs md:text-sm text-slate-400">
                            Manage partner applications
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 
                      [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent 
                      [&::-webkit-scrollbar-thumb]:bg-slate-700 hover:[&::-webkit-scrollbar-thumb]:bg-slate-600 
                      [&::-webkit-scrollbar-thumb]:rounded-full"
                    >
                      {data?.pendingPartner &&
                      data.pendingPartner.length > 0 ? (
                        data.pendingPartner.map((partner) => (
                          <div
                            key={partner._id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all shrink-0"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-lg font-bold text-white overflow-hidden shrink-0">
                                {partner.image ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={partner.image}
                                    alt={partner.name}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <span className="bg-gradient-to-br from-blue-400 to-indigo-400 text-transparent bg-clip-text uppercase">
                                    {partner.name.charAt(0)}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-200 capitalize">
                                  {partner.name}
                                </p>
                                <p className="text-xs text-slate-500 truncate max-w-[200px]">
                                  {partner.email}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-row sm:flex-row items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-white/5 sm:border-t-0">
                              <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-white/5">
                                <Car className="w-4 h-4 text-slate-400" />
                                <span className="text-xs font-medium text-slate-300 capitalize">
                                  {partner.vehicleType}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors">
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-4" />
                          <p className="text-base font-semibold text-slate-200">
                            Inbox Zero!
                          </p>
                          <p className="text-sm text-slate-500 mt-1">
                            No partners waiting for verification right now.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Donut Chart */}
                  <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 h-100 rounded-3xl p-5 md:p-6 flex flex-col">
                    <h2 className="text-lg font-bold text-white mb-1">
                      Fleet Distribution
                    </h2>
                    <p className="text-xs text-slate-400 mb-2">
                      Current partner status overview
                    </p>

                    {data?.totalPartners === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center min-h-[250px]">
                        <PieChart className="w-12 h-12 text-slate-600 mb-2 opacity-50" />
                        <p className="text-xs text-slate-500">
                          Not enough data to generate chart
                        </p>
                      </div>
                    ) : (
                      <div className="flex-1 w-full  relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={65}
                              outerRadius={85}
                              paddingAngle={5}
                              dataKey="value"
                              stroke="none"
                            >
                              {chartData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#0f172a",
                                borderColor: "#1e293b",
                                borderRadius: "12px",
                                color: "#fff",
                              }}
                              itemStyle={{
                                color: "#fff",
                                fontSize: "12px",
                                fontWeight: "600",
                              }}
                              cursor={false}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap items-center justify-center gap-4 ">
                          {chartData.map((item, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="text-[11px] text-slate-400">
                                {item.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. PENDING PARTNER REVIEWS COMPONENT */}
              {activeTab === "partner-reviews" && (
                <PlaceholderComponent
                  title="Pending Partner Reviews"
                  data={data?.pendingPartner || []}
                  setData={setData}
                  desc="Review uploaded documents (Aadhar, License, Bank details) for newly registered partners."
                  icon={FileText}
                />
              )}

              {/* 3. PENDING VIDEO KYC COMPONENT */}
              {activeTab === "video-kyc" && (
                <PendingVideoKyc
                  title="Pending Video KYC"
                  desc="Review face verification and live video KYC submissions from partners."
                  icon={Video}
                />
              )}

              {/* 4. PENDING VEHICLE REVIEWS COMPONENT */}
              {activeTab === "vehicle-reviews" && (
                <PendingVehicleReview
                  title="Pending Vehicle Reviews"
                  desc="Verify vehicle registration certificates (RC) and images."
                  icon={Car}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
