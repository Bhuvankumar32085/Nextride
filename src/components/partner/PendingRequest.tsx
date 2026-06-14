"use client";

import { bookingApi } from "@/app/axios/bookingApi";
import { IBooking } from "@/app/types";
import { socket } from "@/realtime/socket";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  MapPin,
  Navigation,
  CircleDollarSign,
  Milestone,
  Phone,
  Clock,
  Check,
  X,
  Bell,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

// Framer motion variants for layout entries
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
  exit: { opacity: 0, scale: 0.9, x: -50, transition: { duration: 0.3 } },
};

export const PendingRequest = () => {
  const [pendingBookings, setPendingBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const route = useRouter();

  // Real-time integration inside your existing socket effect hook
  useEffect(() => {
    socket.on("NOTIFY_PARTNER_FOR_BOOKING", (data) => {

      // Dynamic logic addition: Appends new socket request to top of list automatically
      if (data) {
        setPendingBookings((prev) => [...prev, data.booking]);
        toast.success("New Ride Request Received!", {
          icon: "⚡",
          style: {
            background: "#0f172a",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
          },
        });
      }
    });
    socket.on("NOTIFY_PARTNER_IF_USER_CANCLE_BOOKING", (data) => {

      // Dynamic logic addition: Appends new socket request to top of list automatically
      // if (data) {
      //   setPendingBookings((prev) =>
      //     prev.filter((booking) => booking._id !== data.booking._id),
      //   );
      toast.error(`Ride Request Cancelled! Booking id= ${data.booking._id}`, {
        icon: "❌",
        style: {
          background: "#0f172a",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.1)",
        },
      });
      // }
    });

    return () => {
      socket.off("NOTIFY_PARTNER_FOR_BOOKING");
      socket.off("NOTIFY_PARTNER_IF_USER_CANCLE_BOOKING");
    };
  }, []);

  // Fetch initial records via API endpoint setup
  const fetchPendingBooking = async () => {
    try {
      setLoading(true);
      const { data } = await bookingApi.get("/bookings", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setPendingBookings(data.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(error);
        const message =
          error.response?.data?.message || "Add mobile Number Error.";
        toast.error(message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPendingBooking();
  }, []);

  // Placeholder actions handlers for buttons context integration
  const handleAcceptRide = async (bookingId: string) => {
    toast.success("Accepting ride allocation bounds...");
    try {
      await bookingApi.patch(
        `/accept/${bookingId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      fetchPendingBooking();
      route.push("/partner/bookings");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(error);
        const message =
          error.response?.data?.message || "Add mobile Number Error.";
        toast.error(message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const handleDeclineRide = async (bookingId: string) => {
    setPendingBookings((prev) => prev.filter((item) => item._id !== bookingId));
    toast.error("Ride request dismissed.");
    try {
      await bookingApi.patch(
        `/reject/${bookingId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      // fetchPendingBooking();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(error);
        const message =
          error.response?.data?.message || "Add mobile Number Error.";
        toast.error(message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] text-white p-4 sm:p-6 lg:p-8 font-sans relative overflow-x-hidden">
      {/* Background Subtle Mesh Lights */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-5%] left-[-5%] h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[150px]" />
        <div className="absolute bottom-[10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-red-500/5 blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        {/* Main Dashboard Panel Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-blue-400 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />{" "}
              Live Request Radar
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight mt-1 bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
              Incoming Orders Pool
            </h1>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/[0.02] border border-white/10 w-fit backdrop-blur-md">
            <Bell size={16} className="text-yellow-500 animate-bounce" />
            <span className="text-sm font-bold font-mono">
              {pendingBookings.length} Requests Available
            </span>
          </div>
        </div>

        {/* Dynamic States Layout Switcher Rendering */}
        {loading ? (
          <div className="w-full flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-sm text-slate-500 font-mono tracking-wider animate-pulse">
              Syncing matching buffers...
            </p>
          </div>
        ) : pendingBookings.length === 0 ? (
          /* EMPTY FALLBACK CONTAINER STATE */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-dashed border-white/10 bg-white/[0.01] p-12 text-center max-w-md mx-auto"
          >
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 mx-auto mb-4 shadow-inner">
              <AlertCircle size={22} />
            </div>
            <h3 className="font-bold text-lg text-slate-200">
              No requests in zone
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
              We couldn&apos;t allocate active requests matching your terminal
              perimeter. Standing by for customer pings.
            </p>
          </motion.div>
        ) : (
          /* ACTIVE COMPONENT LIST MATRIX GRID Layout */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {pendingBookings.map((booking) => {
                return (
                  <motion.div
                    key={booking._id}
                    variants={cardVariants}
                    layoutId={booking._id}
                    exit="exit"
                    className="rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/30 backdrop-blur-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden group hover:border-white/20 transition-all duration-300"
                  >
                    {/* Subtle Red Pulse overlay for active requests indicator */}
                    <div className="absolute top-0 left-0 w-[4px] h-full bg-gradient-to-b from-blue-500 to-cyan-400 opacity-80" />

                    {/* Top Stats Strip row layout */}
                    <div className="flex items-center justify-between gap-2 mb-5 pb-3 border-b border-white/5 text-xs">
                      <span className="font-mono text-slate-500 font-bold tracking-wider">
                        REFID: #{booking._id.substring(16, 24).toUpperCase()}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-black tracking-wider uppercase text-[10px]">
                        {booking.bookingStatus}
                      </span>
                    </div>

                    {/* Main Mapping Location coordinates addresses block */}
                    <div className="space-y-5 relative mb-6">
                      <div className="absolute left-[13px] top-[22px] bottom-[22px] w-[2px] bg-gradient-to-b from-blue-500 via-purple-500 to-red-500 opacity-20" />

                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-blue-500/10 border border-blue-500/20 p-1.5 shrink-0 mt-0.5">
                          <MapPin className="text-blue-400" size={14} />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-black text-slate-500 tracking-wider block">
                            PICKUP LOCATION
                          </span>
                          <p className="text-slate-200 text-xs sm:text-sm font-medium leading-normal line-clamp-2">
                            {booking.pickupAddress}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-red-500/10 border border-red-500/20 p-1.5 shrink-0 mt-0.5">
                          <Navigation className="text-red-400" size={14} />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-black text-slate-500 tracking-wider block">
                            DROP DESTINATION
                          </span>
                          <p className="text-slate-200 text-xs sm:text-sm font-medium leading-normal line-clamp-1">
                            {booking.dropAddress}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Metrics block container item matrix labels */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-white/[0.01] border border-white/5 mb-6 text-center">
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-slate-500 font-bold block flex items-center justify-center gap-1">
                          <CircleDollarSign
                            size={10}
                            className="text-yellow-500"
                          />{" "}
                          FARE
                        </span>
                        <p className="font-mono font-black text-sm text-slate-200">
                          ₹{booking.fare}
                        </p>
                      </div>
                      <div className="space-y-0.5 border-x border-white/5">
                        <span className="text-[9px] text-slate-500 font-bold block flex items-center justify-center gap-1">
                          <Milestone size={10} className="text-blue-400" />{" "}
                          TRACK
                        </span>
                        <p className="font-mono font-black text-sm text-slate-200">
                          {(booking.distance || 0) > 0
                            ? `${(booking.distance || 0).toFixed(1)} KM`
                            : "Estimating"}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-slate-500 font-bold block flex items-center justify-center gap-1">
                          <Clock size={10} className="text-purple-400" /> POOLED
                        </span>
                        <p className="font-mono font-bold text-[11px] text-slate-400 mt-0.5">
                          {booking.createdAt
                            ? new Date(booking.createdAt).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )
                            : "Just now"}
                        </p>
                      </div>
                    </div>

                    {/* Communication meta sub strip values */}
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-5 px-1">
                      <Phone size={12} className="text-slate-500" />
                      <span className="font-medium font-mono">
                        Client: +91 {booking.userMobileNumber}
                      </span>
                    </div>

                    {/* Actions buttons control row element triggers */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={() => handleDeclineRide(booking._id)}
                        className="py-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-red-500/10 hover:border-red-500/20 text-xs font-bold text-slate-400 hover:text-red-400 transition-all flex items-center justify-center gap-1.5 group"
                      >
                        <X
                          size={14}
                          className="group-hover:rotate-90 transition-transform duration-300"
                        />{" "}
                        Decline
                      </button>
                      <button
                        onClick={() => handleAcceptRide(booking._id)}
                        className="py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-lg hover:shadow-blue-600/20 font-black text-xs uppercase tracking-wider text-white transition-all flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <Check size={14} strokeWidth={3} /> Accept Order
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};
