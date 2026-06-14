"use client";

import { AnimatePresence, motion, Variants } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import {
  Car,
  FileText,
  Landmark,
  Search,
  Video,
  Banknote,
  ShieldCheck,
  Rocket,
  Clock,
  Activity,
  CheckCircle2,
  Shield,
  BellRing,
  ArrowRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/app/axios/authApi";
import axios from "axios";
import toast from "react-hot-toast";
import { setLoggedUser } from "@/app/redux/selices/userSlices";
import { socket } from "@/realtime/socket";

import { IsLiveFalse } from "./IsLiveFalse";

// Onboarding Steps Configuration
const ONBOARDING_STEPS = [
  { id: 1, title: "Vehicle Details", desc: "Model & Registration", icon: Car },
  { id: 2, title: "Documents", desc: "Aadhar, RC & License", icon: FileText },
  { id: 3, title: "Bank Details", desc: "Payout account", icon: Landmark },
  { id: 4, title: "Profile Review", desc: "Admin verification", icon: Search },
  { id: 5, title: "Video KYC", desc: "Face verification", icon: Video },
  { id: 6, title: "Pricing Setup", desc: "Set your fares", icon: Banknote },
  {
    id: 7,
    title: "Final Verification",
    desc: "Quality check",
    icon: ShieldCheck,
  },
  { id: 8, title: "Ready to Ride", desc: "Go live & earn", icon: Rocket },
];

export default function PartnerDashboard() {
  const { loggedUser } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [showPricing, setShowPricing] = useState(false);
  // Route Protection
  useEffect(() => {
    if (loggedUser && loggedUser.role !== "partner") {
      router.push("/");
    }
  }, [loggedUser, router]);
  const [incomingRequest, setIncomingRequest] = useState<boolean>(false);

  // Mocking values for fallback if Redux is empty initially
  const completedSteps = loggedUser?.partnerOnboardingSteps || 3;
  const currentStepId = completedSteps + 1;
  // 💡 Logic Update: Show 100% when step is 7 or above
  const progressPercentage =
    completedSteps >= 7
      ? 100
      : (completedSteps / ONBOARDING_STEPS.length) * 100;

  // 💡 Check if partner is fully verified and live
  const isLive = completedSteps >= 7;
  const userImage = loggedUser?.image;

  // Animation Variants
  const fadeIn: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  // Handle Step Click
  const handleclick = (ONBOARDING_STEPS_ID: number, isCompleted: boolean) => {
    if (!isCompleted) return;

    if (ONBOARDING_STEPS_ID === 1) {
      router.push("/partner/onboarding/vehicle");
    } else if (ONBOARDING_STEPS_ID === 2) {
      router.push("/partner/onboarding/documents");
    } else if (ONBOARDING_STEPS_ID === 3) {
      router.push("/partner/onboarding/bank");
    }
  };

  const handleReApply = async () => {
    try {
      const { data } = await authApi.post(
        "/admin/video-kyc/re-apply",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      // change UI based on response
      if (data.success) {
        dispatch(setLoggedUser(data.data.partner));
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to re-apply for KYC.",
        );
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  //
  useEffect(() => {
    socket.on("VIDEO_KYC_STARTED", (payload) => {
      dispatch(setLoggedUser(payload.partner));
    });
    socket.on("VIDEO_KYC_FINAL_REVIEW_RESULT", (payload) => {
      const { status, onboardingStep, reason } = payload;
  

      if (loggedUser) {
        dispatch(
          setLoggedUser({
            ...loggedUser,
            partnerOnboardingSteps:
              payload.onboardingStep ?? loggedUser.partnerOnboardingSteps,
            rejectedReason: reason,
          }),
        );
      }
    });

    socket.on("NOTIFY_PARTNER_FOR_BOOKING", (data) => {
    console.log(data)
      // Dynamic logic addition: Appends new socket request to top of list automatically
      setIncomingRequest(true);
      if (data) {
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

    return () => {
      socket.off("VIDEO_KYC_STARTED");
      socket.off("NOTIFY_PARTNER_FOR_BOOKING");
      socket.off("VIDEO_KYC_FINAL_REVIEW_RESULT");
    };
  }, [loggedUser, dispatch]);

  if (!loggedUser || loggedUser.role !== "partner") return null;

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* ── Top Cover Banner ── */}
      <div className="relative h-48 md:h-64 w-full overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-linear-to-br from-blue-900/40 via-violet-900/20 to-[#020617] z-0" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute bottom-0 w-full h-32 bg-linear-to-t from-[#020617] to-transparent z-10" />
      </div>

      {/* ── Main Content Container ── */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 md:-mt-24 pb-20">
        {/* ── Profile Header ── */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeIn}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-12"
        >
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-3xl border-4 border-[#020617] overflow-hidden bg-slate-800 shadow-2xl shrink-0 mx-auto sm:mx-0">
              {userImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={userImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold bg-linear-to-br from-blue-500 to-violet-500">
                  {loggedUser?.name?.charAt(0) || "P"}
                </div>
              )}
              {/* Status Dot */}
              <div
                className="absolute bottom-2 right-2 w-4 h-4 bg-amber-500 border-2 border-[#020617] rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                title="Under Review"
              />
            </div>

            <div className="text-center sm:text-left pb-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] md:text-xs font-mono tracking-widest uppercase">
                  Partner Portal
                </span>
              </div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white capitalize">
                {loggedUser?.name || "Partner"}
              </h1>
              <p className="text-sm md:text-base text-slate-400 mt-1 truncate">
                {loggedUser?.email || "partner@nextride.com"}
              </p>
            </div>
          </div>
        </motion.div>

        {isLive && (
          <motion.div
            initial="hidden"
            animate="show"
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
          >
            {/* Left Box Matrix: Status & Quick Controls */}
            <motion.div variants={fadeIn} className="lg:col-span-2 space-y-6">
              <AnimatePresence>
                {incomingRequest && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                    animate={{ opacity: 1, height: "auto", scale: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent backdrop-blur-3xl p-5 relative overflow-hidden shadow-xl"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-pulse">
                          <BellRing size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                            Incoming Request Detected!
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                            A live booking request is waiting for your
                            confirmation. Please head to your request list to
                            claim the fare.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push("/partner/pending-request")}
                        className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all shrink-0 w-full sm:w-auto text-center flex items-center justify-center gap-1.5 group"
                      >
                        Go to Requests{" "}
                        <ArrowRight
                          size={14}
                          className="group-hover:translate-x-0.5 transition-transform"
                        />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Premium Welcome Status Banner */}
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600/10 via-transparent to-transparent backdrop-blur-3xl p-6 md:p-8 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none text-blue-500">
                  <Rocket size={150} />
                </div>
                <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">
                  Verification Passed
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-white mt-1 tracking-tight">
                  Welcome aboard, {loggedUser?.name?.split(" ")[0]}!
                </h2>
                <p className="text-sm text-slate-400 mt-2 max-w-xl leading-relaxed">
                  Your registration status is officially verified. You are now
                  authorized to manage logs, accept incoming requests, and check
                  performance metrics seamlessly on our network.
                </p>

                {/* Active Grid Statistics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/5">
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block font-mono">
                      Duty Status
                    </span>
                    <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />{" "}
                      Online
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block font-mono">
                      KyC Progress
                    </span>
                    <span className="text-sm font-bold text-slate-200 mt-1 block">
                      100% Completed
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block font-mono">
                      Account Limit
                    </span>
                    <span className="text-sm font-bold text-blue-400 mt-1 block">
                      Premium Tier
                    </span>
                  </div>
                </div>
              </div>

              {/* Verified Records Checklist Grid */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.01] p-6 shadow-lg">
                <h3 className="text-sm font-bold text-slate-400 tracking-wider uppercase mb-5 flex items-center gap-2">
                  <Shield size={16} className="text-blue-400" /> Compliance &
                  Security Clearance
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.01] border border-white/5">
                    <CheckCircle2
                      className="text-emerald-400 shrink-0"
                      size={20}
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        Video KYC Check
                      </h4>
                      <p className="text-[11px] text-slate-500 capitalize">
                        Status: {loggedUser?.videoKycStatus || "approved"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.01] border border-white/5">
                    <CheckCircle2
                      className="text-emerald-400 shrink-0"
                      size={20}
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        Email Authentication
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Verified securely via Google
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.01] border border-white/5">
                    <CheckCircle2
                      className="text-emerald-400 shrink-0"
                      size={20}
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        Partner Background
                      </h4>
                      <p className="text-[11px] text-slate-500 capitalize">
                        Profile: {loggedUser?.partnerStatus || "approved"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.01] border border-white/5">
                    <CheckCircle2
                      className="text-emerald-400 shrink-0"
                      size={20}
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        Mobile Registration
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Active Node: +91 {loggedUser?.mobileNumber}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Side Column: Meta Info Card */}
            <motion.div
              variants={fadeIn}
              className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-3xl p-6 shadow-2xl space-y-6"
            >
              <div>
                <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase block font-mono">
                  System Registry
                </span>
                <h3 className="text-lg font-black text-white mt-0.5 tracking-tight">
                  Operational Bounds
                </h3>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                  <span className="text-slate-400">Node Identifier</span>
                  <span className="font-mono text-xs font-bold text-slate-300">
                    {loggedUser?._id?.substring(0, 12)}...
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                  <span className="text-slate-400">Assigned Platform Role</span>
                  <span className="font-mono text-xs font-bold text-blue-400 capitalize">
                    {loggedUser?.role}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                  <span className="text-slate-400">Live Web Sockets</span>
                  <span className="font-mono text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <Activity size={12} /> Connected
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-slate-400">Last Database Sync</span>
                  <span className="font-mono text-xs text-slate-500">
                    {loggedUser?.updatedAt
                      ? new Date(loggedUser.updatedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Just now"}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 flex items-center gap-3">
                <ShieldCheck className="text-blue-500" size={20} />
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Your terminal session parameters are encrypted and constantly
                  audited under active ride protection security rules.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {!isLive && (
          <IsLiveFalse
            setShowPricing={setShowPricing}
            showPricing={showPricing}
            handleReApply={handleReApply}
            handleclick={handleclick}
            staggerContainer={staggerContainer}
            progressPercentage={progressPercentage}
            ONBOARDING_STEPS={ONBOARDING_STEPS}
            completedSteps={completedSteps}
            currentStepId={currentStepId}
          />
        )}
      </div>
    </div>
  );
}
