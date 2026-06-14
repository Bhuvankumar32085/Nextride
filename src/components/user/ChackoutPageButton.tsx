"use client";

import { Status } from "@/app/(page)/user/checkout/page";
import { bookingApi } from "@/app/axios/bookingApi";
import { IUser } from "@/app/types";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  Wallet,
  XCircle,
  Smartphone,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";
import toast from "react-hot-toast";

interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

type PropsType = {
  loggedUser: IUser | null;
  userMobileNumber: string;
  setMobileNumber: Dispatch<SetStateAction<string>>;
  handleAddMobileNumber: () => Promise<void>;
  showPaymentModel: boolean;
  isProcessing: boolean;
  bookingStatus: Status;
  handlePayment: () => Promise<void>;
  totalFare: number;
  bookingId: string;
  setpaymetDeadline: Dispatch<SetStateAction<string | Date | undefined>>;
  setPaymentMathodForFatching: Dispatch<
    SetStateAction<"Cod" | "Online" | "Start">
  >;
  paymentMethodForFatching: "Cod" | "Online" | "Start";
  setPaymentStatusForOnline: Dispatch<
    SetStateAction<"pending" | "paid" | "failed">
  >;
  paymentStatusForOnline: "pending" | "paid" | "failed";
  setBookingStatus: Dispatch<SetStateAction<Status>>;
};

const ChackoutPageButton = ({
  loggedUser,
  userMobileNumber,
  setMobileNumber,
  handleAddMobileNumber,
  showPaymentModel,
  isProcessing,
  bookingStatus,
  handlePayment,
  totalFare,
  bookingId,
  setpaymetDeadline,
  setPaymentMathodForFatching,
  paymentMethodForFatching,
  setPaymentStatusForOnline,
  paymentStatusForOnline,
  setBookingStatus,
}: PropsType) => {
  const [paymentMethod, setPaymentMathod] = useState<"Cod" | "Online">("Cod");
  const router = useRouter();

  const handlePayment2 = async () => {
    if (paymentMethod === "Online") {
      try {
        const { data } = await bookingApi.post(
          `/create-payment-online-order`,
          { bookingId, totalFare },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        const options = {
          key: data.data.key,
          amount: data.data.amount,
          currency: "INR",
          name: "NextRide",
          description: "Ride Payment",
          order_id: data.data.orderId,
          handler: async (response: RazorpayPaymentResponse) => {
            const { data } = await bookingApi.post(
              "/verify-payment",
              { bookingId, ...response },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              },
            );

            if (data.success) {
              toast.success("Payment Successful");
              setpaymetDeadline(data.data.paymentDeadline);
              setPaymentStatusForOnline(data.data.paymentStatusForOnline);
              if (data.data.paymentMethod === "cod") {
                setPaymentMathodForFatching("Cod");
              } else if (data.data.paymentMethod === "online") {
                setPaymentMathodForFatching("Online");
              }
              setBookingStatus(data.data.bookingStatus);
            } else {
              toast.error("Payment Failed");
            }
          },
          prefill: { name: loggedUser?.name, email: loggedUser?.email },
          theme: { color: "#2563EB" },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(
            error.response?.data?.message || "Create Online Payment error.",
          );
        } else {
          toast.error("An unexpected error occurred.");
        }
      }
    } else if (paymentMethod === "Cod") {
      try {
        const { data } = await bookingApi.post(
          `/create-payment-cod-order`,
          { bookingId, totalFare },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        if (data.success) {
          setBookingStatus(data.data.booking.bookingStatus);
          setpaymetDeadline(data.data.booking.paymentDeadline);
          setPaymentStatusForOnline(data.data.booking.paymentStatusForOnline);
          if (data.data.booking.paymentMethod === "cod") {
            setPaymentMathodForFatching("Cod");
          } else if (data.data.booking.paymentMethod === "online") {
            setPaymentMathodForFatching("Online");
          }
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(
            error.response?.data?.message || "Create COD Payment error.",
          );
        } else {
          toast.error("An unexpected error occurred.");
        }
      }
    }
  };

  return (
    <>
      {loggedUser?.mobileNumber === undefined || !userMobileNumber ? (
        <div className="mt-6 rounded-[28px] border border-amber-500/20 bg-slate-900/60 backdrop-blur-xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.4)]">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner">
              <Smartphone size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-lg text-white tracking-wide uppercase">
                Communication Link
              </h3>
              <p className="mt-1 text-[11px] text-slate-400 leading-relaxed max-w-sm">
                A valid mobile number is required to secure this node. Drivers
                will use this to coordinate your pickup telemetry.
              </p>
            </div>
          </div>

          <div className="mt-6 relative">
            <input
              type="tel"
              placeholder="Enter 10-digit mobile number"
              value={userMobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              maxLength={10}
              className="w-full rounded-2xl bg-white/[0.02] focus:bg-white/[0.04] border border-white/10 px-5 py-4 text-sm text-white placeholder:text-slate-600 outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all duration-300 font-mono tracking-widest"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddMobileNumber}
            className="mt-4 w-full rounded-2xl py-4 font-black text-xs uppercase tracking-widest text-slate-900 bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all"
          >
            Authenticate & Proceed
          </motion.button>
        </div>
      ) : (
        <>
          <div className="mt-6">
            {showPaymentModel ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="mb-4">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest font-mono text-slate-400">
                    Select Gateway
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Online Payment */}
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPaymentMathod("Online")}
                    className={`relative overflow-hidden rounded-[24px] border p-5 transition-all duration-300 text-left ${
                      paymentMethod === "Online"
                        ? "border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                        : "border-white/5 bg-slate-900/50 hover:bg-slate-900 opacity-60"
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 pointer-events-none" />

                    {paymentMethod === "Online" && (
                      <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-[0_0_10px_rgba(59,130,246,0.8)]">
                        <Check size={12} strokeWidth={4} />
                      </div>
                    )}

                    <div className="relative flex flex-col items-center gap-3 text-center">
                      <div
                        className={`h-14 w-14 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
                          paymentMethod === "Online"
                            ? "bg-gradient-to-br from-blue-600 to-cyan-500 border-blue-400 text-white shadow-lg"
                            : "bg-white/5 border-white/10 text-slate-500"
                        }`}
                      >
                        <CreditCard size={24} />
                      </div>
                      <div>
                        <h4
                          className={`font-black text-sm uppercase tracking-wider ${paymentMethod === "Online" ? "text-white" : "text-slate-400"}`}
                        >
                          Digital Pay
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-1 font-mono">
                          UPI • Card • Wallet
                        </p>
                      </div>
                    </div>
                  </motion.button>

                  {/* Cash Payment */}
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPaymentMathod("Cod")}
                    className={`relative overflow-hidden rounded-[24px] border p-5 transition-all duration-300 text-left ${
                      paymentMethod === "Cod"
                        ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                        : "border-white/5 bg-slate-900/50 hover:bg-slate-900 opacity-60"
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 pointer-events-none" />

                    {paymentMethod === "Cod" && (
                      <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-[0_0_10px_rgba(16,185,129,0.8)]">
                        <Check size={12} strokeWidth={4} />
                      </div>
                    )}

                    <div className="relative flex flex-col items-center gap-3 text-center">
                      <div
                        className={`h-14 w-14 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
                          paymentMethod === "Cod"
                            ? "bg-gradient-to-br from-emerald-600 to-teal-500 border-emerald-400 text-white shadow-lg"
                            : "bg-white/5 border-white/10 text-slate-500"
                        }`}
                      >
                        <Wallet size={24} />
                      </div>
                      <div>
                        <h4
                          className={`font-black text-sm uppercase tracking-wider ${paymentMethod === "Cod" ? "text-white" : "text-slate-400"}`}
                        >
                          Physical Cash
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-1 font-mono">
                          Pay after drop
                        </p>
                      </div>
                    </div>
                  </motion.button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isProcessing}
                  onClick={handlePayment2}
                  className="w-full mt-4 rounded-[20px] bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 py-4 font-black text-xs uppercase tracking-widest text-white shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authenticating Escrow...</span>
                    </div>
                  ) : (
                    <>
                      <CreditCard
                        size={16}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                      <span>
                        Confirm{" "}
                        {paymentMethod === "Online" ? "Digital" : "Cash"} Ledger
                        • ₹{totalFare}
                      </span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            ) : (
              <>
                {paymentMethodForFatching === "Cod" ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full rounded-[32px] border border-amber-500/30 bg-slate-900/80 p-6 backdrop-blur-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/40 shadow-inner">
                        <CheckCircle2 className="h-7 w-7 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="font-black text-white text-lg uppercase tracking-wide">
                          Setup Confirmed
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5 font-mono">
                          Cash on Delivery (COD) Authorized.
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 rounded-2xl bg-black/40 border border-white/5 p-4 relative z-10">
                      <p className="text-[10px] text-amber-400 font-black tracking-widest uppercase font-mono mb-2">
                        Escrow Pending
                      </p>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Route locked successfully. Physical cash transaction is
                        required upon reaching the final destination node.
                      </p>
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-mono">
                          Authorized Mode
                        </span>
                        <span className="font-black text-amber-400 uppercase tracking-wider">
                          Physical Cash
                        </span>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push(`/user/ride/${bookingId}`)}
                      className="mt-5 w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 font-black text-xs text-slate-950 uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] relative z-10"
                    >
                      <span>Access Live Radar</span>
                      <ArrowRight size={16} />
                    </motion.button>
                  </motion.div>
                ) : paymentStatusForOnline === "paid" ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full rounded-[32px] border border-emerald-500/30 bg-slate-900/80 p-6 backdrop-blur-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/40 shadow-inner">
                        <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="font-black text-white text-lg uppercase tracking-wide">
                          Gateway Cleared
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5 font-mono">
                          Digital escrow successfully funded.
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 rounded-2xl bg-black/40 border border-white/5 p-4 relative z-10">
                      <p className="text-[10px] text-emerald-400 font-black tracking-widest uppercase font-mono mb-2">
                        ✓ Balance Verified
                      </p>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Partner node has been notified. Live synchronization
                        interface is now active.
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push(`/user/ride/${bookingId}`)}
                      className="mt-5 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 font-black text-xs text-slate-950 uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] relative z-10"
                    >
                      <span>Access Live Radar</span>
                      <ArrowRight size={16} />
                    </motion.button>
                  </motion.div>
                ) : paymentStatusForOnline === "failed" ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full rounded-[32px] border border-red-500/30 bg-slate-900/80 p-6 backdrop-blur-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-500/20 border border-red-500/40 shadow-inner">
                        <XCircle className="h-7 w-7 text-red-400" />
                      </div>
                      <div>
                        <h3 className="font-black text-white text-lg uppercase tracking-wide">
                          Auth Rejected
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5 font-mono">
                          Gateway denied the transaction.
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handlePayment}
                      className="mt-6 w-full rounded-xl bg-gradient-to-r from-red-600 to-rose-500 py-3.5 font-black text-xs text-white uppercase tracking-widest shadow-[0_0_20px_rgba(225,29,72,0.3)] relative z-10"
                    >
                      Retry Handshake
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isProcessing || bookingStatus === "expired"}
                    onClick={handlePayment}
                    className="w-full relative overflow-hidden rounded-[20px] bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 py-4 font-black text-xs uppercase tracking-widest text-white shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Initializing Protocol...</span>
                      </div>
                    ) : (
                      <>
                        <CreditCard
                          size={16}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                        <span>
                          {bookingStatus === "awaiting_payment"
                            ? `Finalize Escrow • ₹${totalFare}`
                            : bookingStatus === "expired"
                              ? "Session Expired"
                              : bookingStatus == "idle"
                                ? "Confirm Request"
                                : `Lock & Initialize Ride • ₹${totalFare}`}
                        </span>
                      </>
                    )}
                  </motion.button>
                )}
              </>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default ChackoutPageButton;
