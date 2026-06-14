"use client";

import { rideApi } from "@/app/axios/rideApi";
import { IVehicle } from "@/app/types";
import axios from "axios";
import {
  CheckCircle2,
  LucideIcon,
  Eye,
  X,
  Check,
  XCircle,
  Car,
  Bike,
  Truck,
  Zap,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const Portal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    return () => setMounted(false);
  }, []);

  if (!mounted) return null;
  return createPortal(children, document.body);
};

type Props = {
  title: string;
  desc: string;
  icon: LucideIcon;
};

// ── Type-Safe Icon Helper ──
const VehicleTypeIcon = ({ type }: { type: IVehicle["type"] }) => {
  switch (type) {
    case "bike":
      return <Bike className="w-4 h-4" />;
    case "truck":
    case "loading":
      return <Truck className="w-4 h-4" />;
    case "auto":
      return <Zap className="w-4 h-4" />;
    case "car":
    default:
      return <Car className="w-4 h-4" />;
  }
};

const PendingVehicleReview = ({ title, desc, icon: Icon }: Props) => {
  // ── States ──
  const [pendingVehicles, setPendingVehicles] = useState<IVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Modal States ──
  const [selectedVehicle, setSelectedVehicle] = useState<IVehicle | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // ── API Calls wrapped in useCallback (React Best Practice) ──
  const fetchPendingVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const { data } = await rideApi.get("/admin/pending-vehicles", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setPendingVehicles(data.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast(error.response?.data?.message || "Failed to fetch data.", {
          icon: "⚠️",
        });
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Effects ──
  useEffect(() => {
    fetchPendingVehicles();
  }, [fetchPendingVehicles]);

  // Handle background scroll lock safely
  useEffect(() => {
    if (typeof window !== "undefined") {
      const shouldLock = isDetailsOpen || isRejectOpen || isApproveOpen;
      document.body.style.overflow = shouldLock ? "hidden" : "unset";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isDetailsOpen, isRejectOpen, isApproveOpen]);

  // ── Handlers ──
  const handleViewDetails = useCallback((vehicle: IVehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailsOpen(true);
  }, []);

  const handleApproveConfirm = async () => {
    if (!selectedVehicle) return;
    try {
      const { data } = await rideApi.post(
        `/admin/approve-vehicle/${selectedVehicle._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );

      if (data.success) {
        toast.success(`${selectedVehicle.number} approved successfully!`);
        setPendingVehicles([]);
        fetchPendingVehicles();
        setIsApproveOpen(false);
        setIsDetailsOpen(false);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to approve vehicle.",
        );
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedVehicle || !rejectReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }
    try {
      const { data } = await rideApi.post(
        `/admin/reject-vehicle/${selectedVehicle._id}`,
        { reason: rejectReason },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      if (data.success) {
        toast.success(`${selectedVehicle.number} rejected successfully!`);
        setPendingVehicles([]);
        fetchPendingVehicles();
        setRejectReason("");
        setIsRejectOpen(false);
        setIsDetailsOpen(false);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to reject vehicle.",
        );
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  // ── Loading Skeleton ──
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-3xl shadow-2xl">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-r-2 border-emerald-500 animate-spin flex-reverse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-3xl p-5 md:p-8 flex flex-col min-h-[400px] shadow-2xl relative">
      {/* ── Header ── */}
      <div className="flex items-start gap-4 mb-8 border-b border-white/5 pb-6">
        <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.15)] shrink-0">
          <Icon className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            {title}
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-lg leading-relaxed">
            {desc}
          </p>
        </div>
      </div>

      {/* ── Empty State ── */}
      {(!pendingVehicles || pendingVehicles.length === 0) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center flex-1 min-h-[250px]"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <p className="text-lg font-bold text-white tracking-tight">
            All Caught Up!
          </p>
          <p className="text-sm text-slate-400 mt-1">
            No pending vehicle reviews at the moment.
          </p>
        </motion.div>
      )}

      {/* ── Data Table ── */}
      {pendingVehicles && pendingVehicles.length > 0 && (
        <div className="overflow-x-auto pb-4 custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-[11px] font-semibold uppercase tracking-widest">
                <th className="py-4 px-4 font-medium">Vehicle Photo</th>
                <th className="py-4 px-4 font-medium">Details</th>
                <th className="py-4 px-4 font-medium">Pricing Info</th>
                <th className="py-4 px-4 font-medium">Status</th>
                <th className="py-4 px-4 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pendingVehicles.map((vehicle: IVehicle, index: number) => {
                // Strict type-safe properties
                const photoUrl =
                  vehicle.vehiclePhoto?.url ||
                  vehicle.imageUrl?.url ||
                  "/placeholder.jpg";
                const uniqueKey = vehicle._id || `fallback-id-${index}`;

                return (
                  <tr
                    key={uniqueKey}
                    className="hover:bg-white/[0.03] transition-colors group"
                  >
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-2">
                        <div className="w-20 h-14 rounded-lg bg-slate-800 border border-white/10 overflow-hidden shrink-0 group-hover:border-blue-500/30 transition-colors">
                          <img
                            src={photoUrl}
                            alt={vehicle.vehcleModel}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="inline-flex w-fit px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-400 font-mono text-[10px] font-bold tracking-widest">
                          {vehicle.number}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 align-top pt-5">
                      <div className="flex items-center gap-2 mb-1 text-white font-medium capitalize text-sm">
                        <VehicleTypeIcon type={vehicle.type} />
                        {vehicle.type}
                      </div>
                      <p className="text-xs text-slate-400 max-w-[160px] truncate">
                        {vehicle.vehcleModel}
                      </p>
                    </td>

                    <td className="py-4 px-4 align-top pt-5">
                      <div className="flex flex-col gap-1.5 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 w-8">Base:</span>
                          <span className="font-semibold text-slate-200">
                            ₹{vehicle.baseFare || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 w-8">/km:</span>
                          <span className="font-semibold text-slate-200">
                            ₹{vehicle.pricePerKM || 0}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 align-top pt-5">
                      <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-[11px] font-semibold capitalize inline-flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                        {vehicle.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 align-top pt-5 text-center">
                      <button
                        onClick={() => handleViewDetails(vehicle)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/20 hover:border-transparent text-xs font-semibold rounded-lg transition-all"
                      >
                        <Eye className="w-4 h-4" />
                        Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modals Area (Portal to Body) ── */}
      <Portal>
        <AnimatePresence>
          {/* Modal 1: Details */}
          {isDetailsOpen && selectedVehicle && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="flex justify-between items-center p-5 border-b border-white/10 bg-white/[0.02]">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Car className="w-5 h-5 text-blue-400" />
                    Vehicle Verification
                  </h3>
                  <button
                    onClick={() => setIsDetailsOpen(false)}
                    className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: Image & Number */}
                    <div className="space-y-4">
                      <div className="w-full h-56 rounded-xl border border-white/10 bg-slate-800 overflow-hidden relative group">
                        <img
                          src={
                            selectedVehicle.vehiclePhoto?.url ||
                            selectedVehicle.imageUrl?.url ||
                            "/placeholder.jpg"
                          }
                          alt={selectedVehicle.vehcleModel}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
                        <div className="absolute bottom-4 left-4">
                          <p className="text-[10px] text-slate-300 uppercase tracking-widest mb-1">
                            Registration
                          </p>
                          <div className="px-3 py-1 bg-yellow-500/20 backdrop-blur-md border border-yellow-500/30 rounded-md font-mono text-sm font-bold text-yellow-400 tracking-widest shadow-lg">
                            {selectedVehicle.number}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Technical & Pricing */}
                    <div className="space-y-5">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1.5">
                          Vehicle Type
                        </p>
                        <div className="flex items-center gap-2 text-white font-medium capitalize text-lg">
                          <VehicleTypeIcon type={selectedVehicle.type} />
                          {selectedVehicle.type}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">
                            Model
                          </p>
                          <p
                            className="text-sm text-white font-medium truncate"
                            title={selectedVehicle.vehcleModel}
                          >
                            {selectedVehicle.vehcleModel}
                          </p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">
                            Status
                          </p>
                          <p className="text-sm text-amber-400 font-medium capitalize">
                            {selectedVehicle.status}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-white/5">
                        <h4 className="text-[10px] text-blue-400 uppercase tracking-widest font-semibold">
                          Pricing Configuration
                        </h4>
                        <div className="bg-slate-950/50 rounded-xl p-3 border border-white/5 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400">
                              Base Fare
                            </span>
                            <span className="text-sm font-bold text-white">
                              ₹{selectedVehicle.baseFare || 0}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400">
                              Price Per KM
                            </span>
                            <span className="text-sm font-bold text-white">
                              ₹{selectedVehicle.pricePerKM || 0}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400">
                              Waiting Charge (per min)
                            </span>
                            <span className="text-sm font-bold text-white">
                              ₹{selectedVehicle.waitingCharge || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-slate-900 border-t border-white/10 flex justify-end gap-3 mt-auto">
                  <button
                    onClick={() => setIsRejectOpen(true)}
                    className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-transparent rounded-xl text-sm font-semibold transition-all"
                  >
                    Reject Application
                  </button>
                  <button
                    onClick={() => setIsApproveOpen(true)}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
                  >
                    Approve Vehicle
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Modal 2: Reject Confirmation */}
          {isRejectOpen && (
            <motion.div
              key="approve-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]"></div>

                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 mt-1">
                  <XCircle className="w-5 h-5 text-red-500" />
                  Reject Vehicle
                </h3>
                <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                  Provide a clear reason for rejecting{" "}
                  <span className="font-mono text-white bg-white/10 px-1 rounded">
                    {selectedVehicle?.number}
                  </span>
                  . The partner will see this message.
                </p>

                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="E.g., Document is unreadable, plate mismatch..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 min-h-[120px] resize-none"
                ></textarea>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setIsRejectOpen(false)}
                    className="px-5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRejectConfirm}
                    className="px-5 py-2.5 text-xs font-bold bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all shadow-[0_4px_15px_rgba(239,68,68,0.25)]"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Modal 3: Approve Confirmation */}
          {isApproveOpen && (
            <motion.div
              key="approve-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-sm p-8 shadow-2xl text-center relative overflow-hidden"
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none"></div>

                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-5 relative z-10">
                  <Check className="w-8 h-8 text-emerald-400" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2 relative z-10">
                  Approve Vehicle?
                </h3>
                <p className="text-slate-400 text-xs mb-8 relative z-10 leading-relaxed px-2">
                  Approving{" "}
                  <span className="font-mono text-white bg-white/10 px-1 py-0.5 rounded">
                    {selectedVehicle?.number}
                  </span>{" "}
                  will activate it for rides on the platform immediately.
                </p>

                <div className="flex flex-col gap-3 relative z-10">
                  <button
                    onClick={handleApproveConfirm}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all shadow-[0_4px_20px_rgba(16,185,129,0.3)]"
                  >
                    Yes, Approve Vehicle
                  </button>
                  <button
                    onClick={() => setIsApproveOpen(false)}
                    className="w-full py-3 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </div>
  );
};

export default PendingVehicleReview;
