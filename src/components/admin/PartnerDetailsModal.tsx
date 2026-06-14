"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  X,
  Phone,
  Mail,
  Landmark,
  Car,
  FileText,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { AdminPartnerDetails } from "./PlaceholderComponent";

// Note: Replace with your actual AdminPartnerDetails type import
// import { AdminPartnerDetails } from "./PlaceholderComponent";

export interface PartnerDetailsModalProps {
  userProfile: AdminPartnerDetails;
  onClose: () => void;
  handleChangeStatus: (
    partnerId: string,
    newStatus: "approved" | "rejected",
    reason?: string, // <--- Added reason parameter
  ) => void;
  changeStatusLoading?: boolean;
}

export const PartnerDetailsModal = ({
  userProfile,
  onClose,
  handleChangeStatus,
  changeStatusLoading,
}: PartnerDetailsModalProps) => {
  // ── State for Rejection Modal ──
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  if (!userProfile) return null;

  // Handle final rejection submission
  const handleConfirmReject = () => {
    if (!rejectionReason.trim()) return;
    handleChangeStatus(
      userProfile.user._id,
      "rejected",
      rejectionReason.trim(),
    );
    onClose();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#0f172a] border border-white/10 rounded-[32px] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative"
        >
          {/* ── Modal Header ── */}
          <div className="flex items-center justify-between p-5 md:p-6 border-b border-white/5 bg-white/[0.02] shrink-0">
            <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Partner Verification Profile
            </h3>
            <button
              onClick={onClose}
              className="p-2 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── Modal Body (Scrollable) ── */}
          <div className="p-4 md:p-6 overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700 hover:[&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full">
            {/* 1. Basic User Info */}
            <div className="flex flex-col md:flex-row gap-6 mb-8 items-start">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-slate-800 border border-white/10 overflow-hidden shrink-0 shadow-lg">
                {userProfile.user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={userProfile.user.image}
                    alt="User"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-blue-400 bg-blue-500/10">
                    {userProfile.user.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Full Name</p>
                  <p className="text-base md:text-lg font-bold text-white capitalize">
                    {userProfile.user.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Mobile Number</p>
                  <p className="text-sm md:text-base font-medium text-slate-300 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-400" /> +91{" "}
                    {userProfile.user.mobileNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Email Address</p>
                  <p className="text-sm md:text-base font-medium text-slate-300 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-400" />{" "}
                    {userProfile.user.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Partner Status</p>
                  <p
                    className={`text-sm font-medium capitalize ${
                      userProfile.user.partnerStatus === "approved"
                        ? "text-emerald-400"
                        : userProfile.user.partnerStatus === "rejected"
                          ? "text-rose-400"
                          : "text-amber-400"
                    }`}
                  >
                    {userProfile.user.partnerStatus}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    Application Date
                  </p>
                  <p className="text-sm font-medium text-slate-300">
                    {new Date(userProfile.user.createdAt).toLocaleDateString(
                      "en-IN",
                      { day: "2-digit", month: "short", year: "numeric" },
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-8">
              {/* 2. Bank Details */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 md:p-5">
                <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                  <Landmark className="w-5 h-5 text-amber-400" />
                  <h4 className="font-bold text-white text-sm md:text-base">
                    Bank Details
                  </h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">Bank Name</span>
                    <span className="text-xs md:text-sm font-medium text-white">
                      {userProfile.bank.bankName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">
                      Account Holder
                    </span>
                    <span className="text-xs md:text-sm font-medium text-white capitalize">
                      {userProfile.bank.accountHolderName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">Account No.</span>
                    <span className="text-xs md:text-sm font-mono text-white">
                      {userProfile.bank.accountNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">IFSC Code</span>
                    <span className="text-xs md:text-sm font-mono text-white">
                      {userProfile.bank.ifscCode}
                    </span>
                  </div>
                  {userProfile.bank.upi && (
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">UPI ID</span>
                      <span className="text-xs md:text-sm font-medium text-emerald-400">
                        {userProfile.bank.upi}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Vehicle Details */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 md:p-5">
                <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                  <Car className="w-5 h-5 text-cyan-400" />
                  <h4 className="font-bold text-white text-sm md:text-base">
                    Vehicle Details
                  </h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">Category</span>
                    <span className="text-xs md:text-sm font-medium text-white capitalize">
                      {userProfile.vehicle.type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">
                      Vehicle Model
                    </span>
                    <span className="text-xs md:text-sm font-medium text-white capitalize">
                      {userProfile.vehicle.vehcleModel}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-slate-500">
                      License Plate
                    </span>
                    <span className="text-[10px] md:text-xs font-bold tracking-wider px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-md uppercase">
                      {userProfile.vehicle.number}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Documents Showcase */}
            <div>
              <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                <FileText className="w-5 h-5 text-purple-400" />
                <h4 className="font-bold text-white text-sm md:text-base">
                  Uploaded Documents
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-black/40 border border-white/10 rounded-xl p-3 flex flex-col items-center gap-3">
                  <span className="text-xs font-semibold text-slate-300">
                    Aadhar Card
                  </span>
                  <a
                    href={userProfile.documents.aadharCardUrl.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full h-32 rounded-lg overflow-hidden border border-white/10 block hover:opacity-80 transition-opacity"
                  >
                    <Image
                      src={userProfile.documents.aadharCardUrl.url}
                      alt="Aadhar"
                      className="w-full h-full object-cover"
                      width={128}
                      height={128}
                    />
                  </a>
                </div>
                <div className="bg-black/40 border border-white/10 rounded-xl p-3 flex flex-col items-center gap-3">
                  <span className="text-xs font-semibold text-slate-300">
                    Driving License
                  </span>
                  <a
                    href={userProfile.documents.licenseUrl.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full h-32 rounded-lg overflow-hidden border border-white/10 block hover:opacity-80 transition-opacity"
                  >
                    <Image
                      src={userProfile.documents.licenseUrl.url}
                      alt="License"
                      className="w-full h-full object-cover"
                      width={128}
                      height={128}
                    />
                  </a>
                </div>
                <div className="bg-black/40 border border-white/10 rounded-xl p-3 flex flex-col items-center gap-3">
                  <span className="text-xs font-semibold text-slate-300">
                    RC Book
                  </span>
                  <a
                    href={userProfile.documents.rcUrl.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full h-32 rounded-lg overflow-hidden border border-white/10 block hover:opacity-80 transition-opacity"
                  >
                    <Image
                      src={userProfile.documents.rcUrl.url}
                      alt="RC Book"
                      className="w-full h-full object-cover"
                      width={128}
                      height={128}
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ── Modal Footer Actions ── */}
          <div className="p-4 md:p-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-end gap-3 shrink-0">
            <button
              onClick={onClose}
              className="px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setIsRejectModalOpen(true)} // Open Reject Modal instead of calling API directly
              disabled={changeStatusLoading}
              className="px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" /> Reject
            </button>
            <button
              onClick={() =>
                handleChangeStatus(userProfile.user._id, "approved")
              }
              disabled={changeStatusLoading}
              className="px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors flex items-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" /> Approve
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Reject Reason Glassmorphic Popup ── */}
      <AnimatePresence>
        {isRejectModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-900/60 border border-white/10 rounded-[24px] p-6 w-full max-w-md shadow-2xl backdrop-blur-2xl relative overflow-hidden"
            >
              {/* Decorative Red Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 blur-[60px] rounded-full pointer-events-none" />

              <h4 className="text-xl font-bold text-white mb-2 flex items-center gap-2 relative z-10">
                <XCircle className="w-5 h-5 text-rose-400" />
                Reason for Rejection
              </h4>
              <p className="text-sm text-slate-400 mb-5 relative z-10">
                Please provide a clear reason for rejecting this partner. This
                message will be sent to them.
              </p>

              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Blurred Aadhar card, Invalid vehicle RC, Name mismatch..."
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500/50 transition-colors min-h-[120px] resize-none mb-6 relative z-10"
              />

              <div className="flex items-center justify-end gap-3 relative z-10">
                <button
                  onClick={() => {
                    setIsRejectModalOpen(false);
                    setRejectionReason(""); // reset reason on cancel
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReject}
                  disabled={changeStatusLoading || !rejectionReason.trim()}
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {changeStatusLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    "Confirm Reject"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
