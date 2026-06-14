"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { bookingApi } from "@/app/axios/bookingApi";
import { IBooking } from "@/app/types";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  MapPin,
  Navigation,
  Clock,
  CircleDollarSign,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Phone,
  Coins,
  XCircle,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { socket } from "@/realtime/socket";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

// --- Live Ticking Countdown Sub-Component for Partner ---
const DriverDeadlineTimer = ({ deadline }: { deadline: string | Date }) => {
  const [timeLeft, setTimeLeft] = useState("00:00");
  const [isCritical, setIsOriginal] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const difference = +new Date(deadline) - +new Date();
      if (difference <= 0) {
        setTimeLeft("Window Expired");
        return false;
      }

      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      if (minutes < 1) setIsOriginal(true);

      setTimeLeft(
        `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds} Min`,
      );
      return true;
    };

    updateTimer();
    const interval = setInterval(() => {
      const active = updateTimer();
      if (!active) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  return (
    <span
      className={`font-mono font-black tracking-wider text-sm sm:text-base ${isCritical ? "text-red-500 animate-pulse" : "text-amber-400"}`}
    >
      {timeLeft}
    </span>
  );
};

// --- Animation Config Matrix ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 25, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 90, damping: 15 },
  },
};

export default function PartnerBookings() {
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await bookingApi.get("/partner/bookings", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (data.success) {
        setBookings(data.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(error.response?.data);
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Real-time Sockets Listeners Room ---
  useEffect(() => {
    // 1. Listen for Payment Success events
    socket.on("NOTIFY_PARTNER_IF_USER_SUCCESSFULLY_GET_PAYMNET", (data) => {
      if (data?.booking) {
        setBookings((prev) =>
          prev.map((booking) =>
            booking._id === data.booking._id ? data.booking : booking,
          ),
        );

        toast.success("Customer completed payment!", {
          icon: "💳",
          style: {
            background: "#0f172a",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
          },
        });
      }
    });

    // 2. ADDED: Listen for Ride Cancellation events in real-time
    socket.on("NOTIFY_PARTNER_IF_USER_CANCLE_BOOKING", (data) => {
      if (data) {
        setBookings((prev) =>
          prev.map((booking) =>
            booking._id === data.booking._id ? data.booking : booking,
          ),
        );

        toast.error("This ride has been cancelled by the user.", {
          icon: "🚨",
          style: {
            background: "#1e1b4b",
            color: "#fda4af",
            border: "1px solid rgba(244,63,94,0.2)",
          },
        });
      }
    });

    return () => {
      socket.off("NOTIFY_PARTNER_IF_USER_SUCCESSFULLY_GET_PAYMNET");
      socket.off("NOTIFY_PARTNER_BOOKING_CANCELLED");
    };
  }, []);

  // Dismiss a cancelled booking card from view manually
  const dismissCancelledCard = (id: string) => {
    setBookings((prev) => prev.filter((b) => b._id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#020617] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-mono tracking-wider animate-pulse">
          Syncing Active Bookings...
        </p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="min-h-screen w-full bg-[#020617] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-dashed border-white/10 bg-white/[0.01] p-12 text-center max-w-sm w-full"
        >
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 mx-auto mb-4">
            <AlertCircle size={22} />
          </div>
          <h3 className="font-bold text-lg text-slate-200">No Active Rides</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
            You don&apos;t have any accepted or ongoing bookings right now.
            Active tickets will appear here live.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#020617] text-white p-4 sm:p-6 lg:p-8 font-sans relative overflow-x-hidden selection:bg-blue-500/30">
      {/* Subtle Mesh Background Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[150px]" />
        <div className="absolute bottom-[10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[150px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-4xl mx-auto space-y-6"
      >
        {/* Page Section Title */}
        <div className="border-b border-white/5 pb-4 mb-2">
          <span className="text-xs font-black tracking-widest text-blue-400 uppercase">
            Operational Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-0.5">
            My Active Assignments
          </h1>
        </div>

        <AnimatePresence mode="popLayout">
          {bookings.map((booking) => {
            const isAwaiting = booking.bookingStatus === "awaiting_payment";
            const isConfirmed = booking.bookingStatus === "confirmed";
            const isCancelled = booking.bookingStatus === "cancelled";

            const finalDisplayFare =
              isConfirmed && booking.totalFare
                ? booking.totalFare
                : booking.fare;

            return (
              <motion.div
                key={booking._id}
                variants={cardVariants}
                layoutId={booking._id}
                exit={{ opacity: 0, scale: 0.9, x: 30 }}
                className={`rounded-3xl border transition-all duration-300 p-5 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-3xl ${
                  isCancelled
                    ? "border-red-500/30 bg-gradient-to-b from-red-950/20 to-slate-950/60"
                    : isAwaiting
                      ? "border-amber-500/20 bg-gradient-to-b from-slate-900/60 to-slate-950/40"
                      : isConfirmed
                        ? "border-blue-500/20 bg-gradient-to-b from-slate-900/50 to-slate-950/30 shadow-blue-500/[0.02]"
                        : "border-emerald-500/20 bg-gradient-to-b from-slate-900/40 to-slate-950/20"
                }`}
              >
                {/* Dynamic Status Vertical Bar Stripe Indicator */}
                <div
                  className={`absolute top-0 left-0 w-[4px] h-full ${
                    isCancelled
                      ? "bg-red-500"
                      : isAwaiting
                        ? "bg-amber-500"
                        : isConfirmed
                          ? "bg-blue-500"
                          : "bg-emerald-500"
                  }`}
                />

                {/* Card Top Control Metadata Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-500 font-bold tracking-wider">
                      BOOKING ID: #{booking._id.substring(16, 24).toUpperCase()}
                    </span>
                  </div>

                  {/* Status Badges Row wrapper */}
                  <div className="flex items-center gap-2">
                    {isCancelled && (
                      <span className="rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 text-[10px] font-black tracking-wider text-red-400 uppercase flex items-center gap-1">
                        <XCircle size={12} /> Ride Cancelled
                      </span>
                    )}
                    {isAwaiting && (
                      <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-[10px] font-black tracking-wider text-amber-400 uppercase flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />{" "}
                        Awaiting User Payment
                      </span>
                    )}
                    {isConfirmed && (
                      <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-[10px] font-black tracking-wider text-blue-400 uppercase flex items-center gap-1 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                        <CheckCircle2 size={12} /> Setup Confirmed
                      </span>
                    )}
                    {!isAwaiting && !isConfirmed && !isCancelled && (
                      <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[10px] font-black tracking-wider text-emerald-400 uppercase flex items-center gap-1">
                        <CheckCircle2 size={12} /> Active Transit
                      </span>
                    )}
                  </div>
                </div>

                {/* Address Geolocation Routing block */}
                <div className="space-y-4 relative mb-6">
                  <div className="absolute left-[13px] top-[20px] bottom-[20px] w-[2px] bg-white/5" />

                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-blue-500/10 border border-blue-500/20 p-1.5 shrink-0 mt-0.5">
                      <MapPin className="text-blue-400" size={14} />
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-slate-500 tracking-wider block">
                        PICKUP PERIMETER
                      </span>
                      <p className="text-slate-200 text-xs sm:text-sm font-medium mt-0.5 leading-relaxed">
                        {booking.pickupAddress}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-red-500/10 border border-red-500/20 p-1.5 shrink-0 mt-0.5">
                      <Navigation className="text-red-400" size={14} />
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-slate-500 tracking-wider block">
                        DROP DESTINATION
                      </span>
                      <p className="text-slate-200 text-xs sm:text-sm font-medium mt-0.5 leading-relaxed">
                        {booking.dropAddress}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Numerical Ride Grid Stats Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-white/[0.01] border border-white/5 text-center sm:text-left">
                  <div className="p-1.5 sm:px-3">
                    <span className="text-[9px] text-slate-500 font-bold uppercase flex items-center justify-center sm:justify-start gap-1 font-mono">
                      <CircleDollarSign
                        size={11}
                        className={
                          isConfirmed ? "text-blue-400" : "text-emerald-500"
                        }
                      />
                      {isConfirmed ? "Trip Total Fare" : "Estimated Fare"}
                    </span>
                    <p
                      className={`font-mono font-black text-base sm:text-lg mt-0.5 ${
                        isCancelled
                          ? "text-slate-500 line-through"
                          : isConfirmed
                            ? "text-blue-400"
                            : "text-slate-100"
                      }`}
                    >
                      ₹{finalDisplayFare}
                    </p>
                  </div>

                  <div className="p-1.5 sm:px-3 border-l sm:border-x border-white/5">
                    <span className="text-[9px] text-slate-500 font-bold uppercase flex items-center justify-center sm:justify-start gap-1 font-mono">
                      <CreditCard size={11} className="text-blue-400" /> Payment
                      Method
                    </span>
                    <p
                      className={`font-bold text-xs sm:text-sm mt-1 capitalize tracking-wide ${
                        isCancelled
                          ? "text-slate-500"
                          : booking.paymentMethod === "cod"
                            ? "text-orange-400"
                            : booking.paymentMethod === "online"
                              ? "text-cyan-400"
                              : "text-slate-400"
                      }`}
                    >
                      {isCancelled
                        ? "Terminated"
                        : booking.paymentMethod
                          ? booking.paymentMethod === "cod"
                            ? "Cash on Ride (COD)"
                            : "Online Wallet"
                          : "Not Selected Yet"}
                    </p>
                  </div>

                  <div className="p-1.5 sm:px-3 border-t sm:border-t-0 border-white/5 sm:border-none col-span-2 sm:col-span-1">
                    <span className="text-[9px] text-slate-500 font-bold uppercase flex items-center justify-center sm:justify-start gap-1 font-mono">
                      <Phone size={11} className="text-purple-400" /> Customer
                      Node
                    </span>
                    <p
                      className={`font-mono text-xs font-bold mt-1 block ${isCancelled ? "text-slate-500 line-through" : "text-slate-400"}`}
                    >
                      +91 {booking.userMobileNumber}
                    </p>
                  </div>
                </div>

                {/* --- 1. LIVE AWAITING PAYMENT COUNTDOWN ALERT --- */}
                {isAwaiting && booking.paymentDeadline && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-md"
                  >
                    <div className="flex items-start gap-2.5">
                      <Clock
                        size={16}
                        className="text-amber-500 mt-0.5 shrink-0 animate-pulse"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-200">
                          Customer Allocation Lockdown
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                          The client has 5 minutes to authenticate the trip
                          payment ledger. State will update instantly upon
                          clearance.
                        </p>
                      </div>
                    </div>
                    <div className="bg-slate-950/60 border border-white/5 px-3 py-1.5 rounded-xl shrink-0 text-center sm:text-right flex items-center sm:block gap-2 justify-between">
                      <span className="text-[9px] font-mono tracking-wider font-bold text-slate-500 uppercase block">
                        Time Remaining
                      </span>
                      <DriverDeadlineTimer deadline={booking.paymentDeadline} />
                    </div>
                  </motion.div>
                )}

                {/* --- 2. PREMIUM CONFIRMED COLLECTION HANDLER ACTIONS --- */}
                {isConfirmed && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 space-y-3"
                  >
                    {booking.paymentMethod === "cod" ? (
                      <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/20 shadow-lg shadow-orange-500/[0.02]">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 shrink-0">
                            <Coins size={18} />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-orange-400 uppercase tracking-wider">
                              Collect Cash Payment
                            </h4>
                            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                              This is a Cash on Ride trip. You must physically
                              collect the final actual amount of{" "}
                              <b className="text-white font-mono text-sm px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                                ₹{booking.totalFare || booking.fare}
                              </b>{" "}
                              from the customer once you reach the destination
                              point.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 shadow-lg shadow-cyan-500/[0.02]">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
                            <ShieldCheck size={18} />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-cyan-400 uppercase tracking-wider">
                              Digital Payment Secured
                            </h4>
                            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                              The full amount of{" "}
                              <b className="text-white font-mono">
                                ₹{booking.totalFare || booking.fare}
                              </b>{" "}
                              has been securely paid online by the customer. It
                              is safely credited to your gateway balance.{" "}
                              <span className="text-cyan-400 font-bold">
                                Do not collect any physical cash from the
                                client.
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push("/partner/active-ride")}
                        className="w-full rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 py-3.5 font-black text-sm uppercase tracking-wider text-black shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2"
                      >
                        <span>Go To Active Ride</span>
                        <ArrowRight size={18} />
                      </motion.button>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.01] border border-white/5 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                      <CheckCircle2 size={13} className="text-emerald-500" />
                      <span>
                        Route clearance parameter validated. Proceed towards
                        client pickup points securely.
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* --- 3. 🚨 NEW: LIVE CANCELLATION STATE DECORATOR OVERLAY --- */}
                {isCancelled && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 p-4 rounded-2xl bg-red-500/5 border border-red-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-xl"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle
                        className="text-red-500 mt-0.5 shrink-0"
                        size={18}
                      />
                      <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">
                          Allocation Stopped
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                          This trip request session parameter has been aborted.
                          Please close this card node to sync with active
                          networks.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => dismissCancelledCard(booking._id)}
                      className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 w-full sm:w-auto"
                    >
                      <Trash2 size={14} /> Dismiss Card
                    </button>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
