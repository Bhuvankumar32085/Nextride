"use client";

import { motion, Variants } from "framer-motion";
import { useAppSelector } from "@/app/redux/hooks";
import {
  Search,
  Video,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertCircle,
  LucideProps,
} from "lucide-react";
import {
  Dispatch,
  ForwardRefExoticComponent,
  RefAttributes,
  SetStateAction,
} from "react";
import { useRouter } from "next/navigation";
import PricingModal from "./PricingModal";

type IStaggerContainer = {
  hidden: {
    opacity: number;
  };
  show: {
    opacity: number;
    transition: {
      staggerChildren: number;
    };
  };
};

type IOnboartding_Step_Type = {
  id: number;
  title: string;
  desc: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
}[];

export const IsLiveFalse = ({
  handleReApply,
  handleclick,
  staggerContainer,
  progressPercentage,
  showPricing,
  setShowPricing,
  ONBOARDING_STEPS,
  completedSteps,
  currentStepId,
}: {
  handleReApply: () => Promise<void>;
  handleclick: (ONBOARDING_STEPS_ID: number, isCompleted: boolean) => void;
  staggerContainer: IStaggerContainer;
  progressPercentage: number;
  showPricing: boolean;
  setShowPricing: Dispatch<SetStateAction<boolean>>;
  ONBOARDING_STEPS: IOnboartding_Step_Type;
  completedSteps: number;
  currentStepId: number;
}) => {
  const { loggedUser } = useAppSelector((state) => state.user);
  const router = useRouter();

  const fadeIn: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <>
      {/* ── Layout Grid (Left: Dashboard, Right: Timeline) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* ── LEFT COLUMN: Main Dashboard Area ── */}

        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Dynamic Status Banner (Review / Rejected) */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeIn}
            className="relative overflow-hidden rounded-3xl p-[1px]"
          >
            {loggedUser?.rejectedReason ? (
              <div className="absolute inset-0 bg-linear-to-r from-red-500/30 via-rose-500/20 to-red-500/30 animate-pulse" />
            ) : (
              <div className="absolute inset-0 bg-linear-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 animate-pulse" />
            )}

            <div className="relative bg-[#0a0f1e]/90 backdrop-blur-3xl rounded-[23px] p-6 md:p-8 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-2xl">
              {/* Icon Box */}

              <div
                className={`p-4 rounded-2xl shrink-0 border ${loggedUser?.rejectedReason ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"}`}
              >
                {loggedUser?.rejectedReason ? (
                  <AlertCircle className="w-8 h-8 md:w-10 md:h-10" />
                ) : (
                  <Search className="w-8 h-8 md:w-10 md:h-10" />
                )}
              </div>
              <div className="flex-1 w-full">
                {loggedUser?.partnerOnboardingSteps !== undefined &&
                loggedUser?.partnerOnboardingSteps <= 3 ? (
                  <>
                    {loggedUser?.rejectedReason ? (
                      <>
                        <h2 className="text-xl md:text-2xl font-bold text-red-400 mb-2">
                          Verification Rejected
                        </h2>

                        <p className="text-sm text-slate-400 leading-relaxed mb-4">
                          Your profile verification was rejected by the admin
                          team. Please review the reason below and update your
                          details.
                        </p>

                        <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 mb-4">
                          <div className="flex items-center gap-2 mb-1.5">
                            <AlertCircle className="w-4 h-4 text-red-400" />

                            <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider">
                              Rejection Reason
                            </h3>
                          </div>

                          <p className="text-sm text-slate-300">
                            {loggedUser.rejectedReason}
                          </p>
                        </div>

                        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-300 w-full sm:w-auto">
                          <TrendingUp className="w-4 h-4 text-blue-400" />
                          You can update details and resubmit.
                        </div>
                      </>
                    ) : (
                      <>
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                          Profile Under Admin Review
                        </h2>

                        <p className="text-sm text-slate-400 leading-relaxed mb-5">
                          Your vehicle, documents, and bank details have been
                          successfully submitted. Our team is currently
                          verifying your profile to ensure safety standards.
                        </p>

                        <div className="inline-flex items-center justify-center sm:justify-start gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-medium text-amber-400 w-full sm:w-auto">
                          <Clock className="w-4 h-4 animate-spin-slow" />
                          Estimated time: 2-4 Hours
                        </div>
                      </>
                    )}
                  </>
                ) : loggedUser?.partnerOnboardingSteps == 4 &&
                  loggedUser?.videoKycStatus === "pending" ? (
                  <>
                    <h2 className="text-xl md:text-2xl font-bold text-cyan-400 mb-2">
                      Ready For Video KYC
                    </h2>

                    <p className="text-sm text-slate-400 leading-relaxed mb-5">
                      Your profile has been successfully verified by our team.
                      Please stay available and keep your camera & microphone
                      ready. An admin will soon start your live Video KYC
                      session for final verification.
                    </p>

                    <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-5 mb-5">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full" />

                      <div className="relative z-10 flex items-start gap-4">
                        <div className="relative mt-1">
                          <div className="w-4 h-4 rounded-full bg-green-400 animate-pulse" />

                          <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-40" />
                        </div>

                        <div>
                          <h3 className="text-white font-semibold text-base mb-1">
                            Waiting For Admin To Start Video KYC
                          </h3>

                          <p className="text-sm text-slate-300 leading-relaxed">
                            Once the admin starts the Video KYC session, you
                            will instantly receive access to join the live
                            verification room.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="inline-flex items-center justify-center sm:justify-start gap-2 bg-cyan-500/10 border border-cyan-500/20 px-4 py-2.5 rounded-xl text-xs font-medium text-cyan-300 w-full sm:w-auto">
                      <Clock className="w-4 h-4 animate-spin-slow" />
                      Waiting for admin to start Video KYC
                    </div>
                  </>
                ) : loggedUser?.partnerOnboardingSteps == 4 &&
                  loggedUser?.videoKycStatus === "in_progress" &&
                  loggedUser?.videoKycRoomId ? (
                  <>
                    <h2 className="text-xl md:text-2xl font-bold text-green-400 mb-2">
                      Video KYC Started
                    </h2>

                    <p className="text-sm text-slate-400 leading-relaxed mb-5">
                      Your live Video KYC session has been started by the admin
                      team. Please join the session now to complete your
                      identity verification process.
                    </p>

                    <div className="relative overflow-hidden bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-5 mb-5">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-3xl rounded-full" />

                      <div className="relative z-10 flex items-start gap-4">
                        <div className="relative mt-1">
                          <div className="w-4 h-4 rounded-full bg-green-400 animate-pulse" />

                          <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-40" />
                        </div>

                        <div>
                          <h3 className="text-white font-semibold text-base mb-1">
                            Admin Is Waiting In Video Room
                          </h3>

                          <p className="text-sm text-slate-300 leading-relaxed">
                            Click the button below to join your secure live
                            Video KYC verification room.
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        router.push(`/video-kyc/${loggedUser.videoKycRoomId}`)
                      }
                      className="w-full cursor-pointer sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold shadow-lg shadow-green-500/20 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Video className="w-5 h-5" />
                      Join Video KYC
                    </button>
                  </>
                ) : loggedUser?.partnerOnboardingSteps == 4 &&
                  loggedUser?.videoKycStatus === "rejected" ? (
                  <>
                    <h2 className="text-xl md:text-2xl font-bold text-red-400 mb-2">
                      Video KYC Rejected
                    </h2>

                    <p className="text-sm text-slate-400 leading-relaxed mb-4">
                      Your Video KYC verification was unsuccessful and has been
                      rejected by the admin team. Please review the reason
                      below.
                    </p>

                    <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider">
                          Rejection Reason
                        </h3>
                      </div>

                      <p className="text-sm text-slate-300">
                        {loggedUser?.videoKycRejectedReason ||
                          "Verification failed during live session."}
                      </p>
                    </div>

                    <div className="flex md:justify-between flex-col md:flex-row gap-4">
                      <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-300 w-full sm:w-auto">
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                        Please contact support or re-apply for KYC.
                      </div>

                      <button
                        onClick={handleReApply}
                        className="w-full sm:w-auto px-6 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-all duration-300 "
                      >
                        Re-Apply
                      </button>
                    </div>
                  </>
                ) : loggedUser?.partnerOnboardingSteps == 5 &&
                  loggedUser?.videoKycStatus === "approved" ? (
                  <>
                    <h2 className="text-xl md:text-2xl font-bold text-emerald-400 mb-2">
                      Video KYC Approved
                    </h2>

                    <p className="text-sm text-slate-400 leading-relaxed mb-5">
                      Congratulations! Your live Video KYC has been successfully
                      verified. You are now ready to set up your pricing and
                      start earning.
                    </p>

                    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-5 mb-5">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />

                      <div className="relative z-10 flex items-start gap-4">
                        <div className="p-2 bg-emerald-500/20 rounded-full border border-emerald-500/30">
                          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        </div>

                        <div>
                          <h3 className="text-white font-semibold text-base mb-1">
                            Identity Verified Successfully
                          </h3>

                          <p className="text-sm text-slate-300 leading-relaxed">
                            All your documents and identity checks have passed
                            our quality standards. Proceed to the next step.
                          </p>
                        </div>
                      </div>
                    </div>

                    {loggedUser?.rejectedReason && (
                      <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          <AlertCircle className="w-4 h-4 text-red-400" />
                          <h3 className="text-white font-semibold text-base">
                            Rejection Reason
                          </h3>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">
                          {loggedUser?.rejectedReason}
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => setShowPricing(true)}
                      className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      Proceed to Pricing Setup
                      <TrendingUp className="w-4 h-4" />
                    </button>
                  </>
                ) : loggedUser?.partnerOnboardingSteps == 6 ? (
                  <>
                    {/* user ko batana ki prising request chali gay h or abhi profile final review pr h */}
                    <h2 className="text-xl md:text-2xl font-bold text-emerald-400 mb-2">
                      Pricing Setup Submitted
                    </h2>
                    <p className="text-sm text-slate-400 leading-relaxed mb-5">
                      Your pricing setup has been submitted successfully. Our
                      team is now reviewing your profile for the final quality
                      check. You will be notified once your profile is approved
                      and ready to go live.
                    </p>
                    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-5 mb-5">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />

                      <div className="relative z-10 flex items-start gap-4">
                        <div className="p-2 bg-emerald-500/20 rounded-full border border-emerald-500/30">
                          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-base mb-1">
                            Pricing Setup Completed
                          </h3>
                          <p className="text-sm text-slate-300 leading-relaxed">
                            Your fare settings have been saved successfully. The
                            admin team is now conducting the final review of
                            your profile. Please wait for the approval to start
                            accepting rides and earning.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  loggedUser?.partnerOnboardingSteps == 7 && <></>
                )}
              </div>
            </div>
          </motion.div>

          {/* Progress Bar Container */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeIn}
            className="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/5 shadow-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-5">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-white">
                  Onboarding Journey
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Complete all 8 steps to start earning.
                </p>
              </div>
              <span className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-cyan-400">
                {progressPercentage.toFixed(0)}%
              </span>
            </div>
            <div className="h-4 md:h-5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5 p-1 shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-linear-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full relative"
              >
                <div
                  className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite] -skew-x-12"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                  }}
                />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* pricing modal */}

        {showPricing && <PricingModal setShowPricing={setShowPricing} />}

        {/* ── RIGHT COLUMN: Modern Glowing Timeline ── */}

        <div className="lg:col-span-4 mt-6 lg:mt-0">
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeIn}
            className="lg:sticky lg:top-24 bg-slate-900/30 backdrop-blur-2xl rounded-3xl p-6 md:p-8 border border-white/5 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
              <h3 className="text-lg font-bold text-white">Steps Tracker</h3>
              <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                {completedSteps}/8 Done
              </span>
            </div>

            <div className="relative ml-2 md:ml-4">
              {/* Background Line */}
              <div className="absolute left-[1.1rem] top-4 bottom-4 w-[2px] bg-slate-800/80 rounded-full" />

              {/* Active Progress Line */}
              <div
                className="absolute left-[1.1rem] top-4 w-[2px] bg-linear-to-b from-emerald-400 via-blue-500 to-transparent transition-all duration-1000 rounded-full"
                style={{
                  height: `${(completedSteps / ONBOARDING_STEPS.length) * 100}%`,
                }}
              />

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="flex flex-col gap-8"
              >
                {ONBOARDING_STEPS.map((step) => {
                  const isCompleted = step.id <= completedSteps;
                  const isCurrent = step.id === currentStepId;
                  const isPending = step.id > currentStepId;
                  const StepIcon = step.icon;

                  return (
                    <motion.div
                      key={step.id}
                      variants={{
                        hidden: { opacity: 0, x: 20 },
                        show: { opacity: 1, x: 0 },
                      }}
                      className="relative z-10 flex items-start gap-5 group"
                    >
                      {/* Status Node */}
                      <div
                        onClick={() => handleclick(step.id, isCompleted)}
                        className={`relative flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full shrink-0 transition-all duration-300 bg-[#0a0f1e] z-10
                          ${isCompleted ? "border-2 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer hover:scale-110" : ""}
                          ${isCurrent ? "border-2 border-blue-500 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.6)] scale-110" : ""}
                          ${isPending ? "border-2 border-slate-800 text-slate-600" : ""}
                        `}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                        ) : (
                          <StepIcon
                            className={`w-4 h-4 md:w-5 md:h-5 ${isCurrent ? "animate-pulse" : ""}`}
                          />
                        )}
                        {/* Current Step Ping */}
                        {isCurrent && (
                          <div className="absolute -inset-2 border border-blue-500/50 rounded-full animate-ping" />
                        )}
                      </div>

                      {/* Text Content */}
                      <div
                        onClick={() => handleclick(step.id, isCompleted)}
                        className={`pt-1 flex-1 transition-opacity duration-300 ${isPending ? "opacity-40" : "opacity-100"} ${isCompleted && "cursor-pointer hover:opacity-80"}`}
                      >
                        <h4
                          className={`text-sm md:text-base font-bold ${isCurrent ? "text-blue-400" : "text-white"}`}
                        >
                          {step.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};
