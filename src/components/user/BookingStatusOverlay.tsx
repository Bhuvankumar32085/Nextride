"use client";

import { motion } from "framer-motion";
import { 
  Check, 
  Loader2, 
  AlertTriangle, 
  XCircle, 
  Compass, 
  CheckCircle2,
  Zap
} from "lucide-react";

type Status =
  | "idle"
  | "requested"
  | "awaiting_payment"
  | "confirmed"
  | "started"
  | "completed"
  | "cancelled"
  | "rejected"
  | "expired";

interface BookingStatusOverlayProps {
  status: Status;
  partnerName: string;
}

export const BookingStatusOverlay = ({ status, partnerName }: BookingStatusOverlayProps) => {
  const coreSteps = [
    { id: "requested", order: 1, title: "Radar Ping", description: `Broadcasting to nearby fleets` },
    { id: "awaiting_payment", order: 2, title: "Node Handshake", description: `${partnerName} allocated` },
    { id: "confirmed", order: 3, title: "Secure Lock", description: "Generating encrypted OTP" },
  ];

  const getStatusWeight = (currentStatus: Status): number => {
    switch (currentStatus) {
      case "idle": return 0;
      case "requested": return 1;
      case "awaiting_payment": return 2;
      case "confirmed": return 3;
      case "started": return 4;
      case "completed": return 5;
      default: return 0;
    }
  };

  const currentWeight = getStatusWeight(status);
  const isTerminalError = ["cancelled", "rejected", "expired"].includes(status);

  const getBannerMeta = () => {
    switch (status) {
      case "idle":
        return { label: "System Idle", classes: "bg-slate-500/10 border-slate-500/20 text-slate-400", desc: "Awaiting your payment validation to ping drivers." };
      case "requested":
        return { label: "Searching", classes: "bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]", desc: `Waiting for ${partnerName} to accept.` };
      case "awaiting_payment":
        return { label: "Match Found", classes: "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]", desc: "Driver matched. Finalizing cryptographic escrow invoice." };
      case "confirmed":
        return { label: "Trip Scheduled", classes: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]", desc: "Ride confirmed! Driver is prepping vehicle cabin." };
      case "started":
        return { label: "In Transit", classes: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]", desc: "Secure lock active. Ride has successfully commenced." };
      case "completed":
        return { label: "Arrived", classes: "bg-green-500/10 border-green-500/30 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]", desc: "Achieved safe destination tracking bounds. Thank you!" };
      default:
        return { label: "Halted", classes: "bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]", desc: "Lifecycle state interface disconnected." };
    }
  };

  const bannerMeta = getBannerMeta();

  return (
    <div className="w-full rounded-[32px] border border-white/5 bg-slate-950/60 backdrop-blur-3xl p-6 relative overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
      <div className={`absolute top-0 left-0 right-0 h-[2px] transition-all duration-700 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent`} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-5 border-b border-white/5 relative z-10">
        <div>
          <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase block font-mono">Telemetry Pipeline</span>
          <h3 className="text-xl font-black text-white tracking-tight mt-0.5">Booking Status</h3>
        </div>

        <div className={`px-3 py-1.5 rounded-full border text-[10px] uppercase tracking-widest font-black font-mono w-fit flex items-center gap-1.5 transition-all duration-500 ${bannerMeta.classes}`}>
          {status === "requested" && <Loader2 size={14} className="animate-spin" />}
          {status === "idle" && <Compass size={14} className="text-slate-500" />}
          {["confirmed", "started", "completed"].includes(status) && <CheckCircle2 size={14} />}
          {bannerMeta.label}
        </div>
      </div>

      {isTerminalError ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 rounded-[24px] bg-red-500/5 border border-red-500/10 text-center relative"
        >
          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-3 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
            {status === "cancelled" ? <XCircle size={26} /> : <AlertTriangle size={26} />}
          </div>
          <h4 className="text-sm font-black text-white tracking-widest uppercase font-mono">Request Dismissed ({status})</h4>
          <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
            {status === "cancelled" && "This booking pipeline was terminated by user cancellation request."}
            {status === "rejected" && `${partnerName} is currently unavailable or declined the handshake request.`}
            {status === "expired" && "The live node request pool expired due to timeout bounds."}
          </p>
        </motion.div>
      ) : status === "started" || status === "completed" ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-[24px] bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border border-blue-500/10 flex items-center gap-4"
        >
          <div className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <Zap size={24} className={status === "started" ? "animate-pulse" : ""} />
          </div>
          <div>
            <h4 className="text-sm font-black text-white tracking-wider uppercase">
              {status === "started" ? "Live Transit Operational" : "Destination Arrived Safely"}
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{bannerMeta.desc}</p>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5 transition-all">
          <div 
            className="absolute left-[19px] top-2 transition-all duration-1000 w-[2px] bg-gradient-to-b from-blue-500 via-cyan-400 to-emerald-500 shadow-[0_0_10px_rgba(56,189,248,0.5)] origin-top"
            style={{ 
              height: currentWeight === 0 ? "0%" : currentWeight === 1 ? "25%" : currentWeight === 2 ? "65%" : "95%" 
            }}
          />

          {coreSteps.map((step) => {
            const isStepCompleted = currentWeight > step.order;
            const isStepActive = status === step.id;

            return (
              <div key={step.id} className="flex items-start gap-4 relative group">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shrink-0 z-10 ${
                    isStepCompleted
                      ? "bg-gradient-to-br from-blue-600 to-blue-500 border-blue-400/50 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                      : isStepActive
                      ? "bg-slate-900 border-cyan-400 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                      : "bg-slate-900 border-white/10 text-slate-600"
                  }`}
                >
                  {isStepCompleted ? (
                    <Check size={18} strokeWidth={3} />
                  ) : isStepActive ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <span className="text-xs font-mono font-black tracking-tighter">0{step.order}</span>
                  )}
                </div>

                <div className="pt-1">
                  <h4
                    className={`text-sm font-black tracking-wide uppercase transition-colors duration-500 ${
                      isStepActive || isStepCompleted ? "text-slate-100" : "text-slate-600"
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p
                    className={`text-xs mt-1 transition-colors duration-500 leading-relaxed ${
                      isStepActive ? "text-cyan-400/90 font-medium" : "text-slate-500"
                    }`}
                  >
                    {isStepActive ? bannerMeta.desc : step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};