"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";
import {
  Landmark,
  User,
  CreditCard,
  Hash,
  Smartphone,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { rideApi } from "@/app/axios/rideApi";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { setLoggedUser } from "@/app/redux/selices/userSlices";

export default function OnboardingBankPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { loggedUser } = useAppSelector((store) => store.user);
  const dispatch = useAppDispatch();


  // State matching your IPartnerBank schema
  const [form, setForm] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    upi: "",
    mobileNumber: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      // Force IFSC code to be uppercase as per schema requirement
      [name]: name === "ifscCode" ? value.toUpperCase() : value,
    });
  };

  const handleSubmit = async () => {
    // if user enbording step is 4 and partner status is verified then uou kan not update the vehicle details
    if (
      loggedUser?.partnerOnboardingSteps === 4 &&
      loggedUser?.partnerStatus === "approved"
    ) {
      return toast.error(
        "Your bank details are already approved. Please contact support to make changes.",
      );
    }

    // Validation
    if (!form.accountHolderName.trim())
      return toast.error("Account Holder Name is required.");
    if (!form.bankName.trim()) return toast.error("Bank Name is required.");
    if (!form.accountNumber.trim())
      return toast.error("Account Number is required.");
    if (!form.ifscCode.trim()) return toast.error("IFSC Code is required.");

    setSubmitting(true);
    try {
      // NOTE: Update this URL to your actual endpoint
      const { data } = await rideApi.post("/add-bank-details", form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("Bank details saved successfully! ");
      toast.success("Onboarding Complete! Welcome aboard.");
      dispatch(
        setLoggedUser({
          ...loggedUser,
          role: "partner",
        }),
      );
      const token = data?.data?.token;
      if (token) {
        localStorage.setItem("token", token);
      }

      // Redirect to Partner Dashboard since onboarding is now complete
      router.push("/partner/dashboard");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to save bank details.",
        );
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const getBankData = async () => {
      try {
        const { data } = await rideApi.get("/bank-details", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (data?.data) {
          setForm({
            accountHolderName: data?.data.partnerBank.accountHolderName || "",
            accountNumber: data?.data.partnerBank.accountNumber || "",
            ifscCode: data?.data.partnerBank.ifscCode || "",
            bankName: data?.data.partnerBank.bankName || "",
            upi: data?.data.partnerBank.upi || "",
            mobileNumber: loggedUser?.mobileNumber || "",
          });
        }
      } catch (error) {
        console.error(error);
        if (axios.isAxiosError(error)) {
          toast.error(
            error.response?.data?.message || "Failed to get bank details.",
          );
        } else {
          toast.error("An unexpected error occurred.");
        }
      }
    };

    getBankData();
  }, [loggedUser?.mobileNumber]);

  return (
    <div className="relative min-h-screen bg-[#020617] flex items-center justify-center p-4 overflow-hidden font-sans">
      {/* ── Background Orbs ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-100 h-100 rounded-full bg-blue-600/10 blur-[100px] top-0 left-10 animate-pulse" />
        <div className="absolute w-75 h-75 rounded-full bg-emerald-600/10 blur-[100px] bottom-10 right-10 animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-xl mx-auto" // max-w-xl gives a perfect width for the 2-column grid
      >
        <div className="absolute -inset-px rounded-[20px] bg-linear-to-br from-blue-600/20 via-emerald-600/10 to-transparent -z-10 blur-sm" />

        {/* Compact padding */}
        <div className="bg-slate-950/90 backdrop-blur-2xl rounded-[20px] p-6 md:p-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* ── Header ── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-5 border-b border-white/5">
            <div>
              <span className="inline-block py-1 px-2.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-mono tracking-widest uppercase mb-2 border border-blue-500/20">
                Step 3 of 3
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight mb-1.5">
                Bank Details
              </h1>
              <p className="text-xs text-slate-400">
                Where should we send your earnings? This information is kept
                strictly secure.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full mt-4 md:mt-0 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
              256-bit Secure
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {/* Account Holder Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono tracking-widest uppercase text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Account Holder Name{" "}
                <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="accountHolderName"
                placeholder="As per bank records"
                value={form.accountHolderName}
                onChange={handleChange}
                className="w-full py-2.5 px-3.5 rounded-lg text-sm text-slate-200 bg-white/3 border border-white/10 outline-none transition-all duration-200 focus:border-blue-500/50 focus:bg-white/5 placeholder:text-slate-600"
              />
            </div>

            {/* Grid for Bank Name & IFSC */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono tracking-widest uppercase text-slate-400 flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5" /> Bank Name{" "}
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="bankName"
                  placeholder="e.g. HDFC Bank"
                  value={form.bankName}
                  onChange={handleChange}
                  className="w-full py-2.5 px-3.5 rounded-lg text-sm text-slate-200 bg-white/3 border border-white/10 outline-none transition-all duration-200 focus:border-blue-500/50 focus:bg-white/5 placeholder:text-slate-600"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono tracking-widest uppercase text-slate-400 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5" /> IFSC Code{" "}
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="ifscCode"
                  placeholder="e.g. HDFC0001234"
                  value={form.ifscCode}
                  onChange={handleChange}
                  className="w-full py-2.5 px-3.5 rounded-lg text-sm text-slate-200 bg-white/3 border border-white/10 outline-none transition-all duration-200 focus:border-blue-500/50 focus:bg-white/5 placeholder:text-slate-600 uppercase"
                />
              </div>
            </div>

            {/* Account Number */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono tracking-widest uppercase text-slate-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" /> Account Number{" "}
                <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="accountNumber"
                placeholder="Enter your account number"
                value={form.accountNumber}
                onChange={handleChange}
                className="w-full py-2.5 px-3.5 rounded-lg text-sm text-slate-200 bg-white/3 border border-white/10 outline-none transition-all duration-200 focus:border-blue-500/50 focus:bg-white/5 placeholder:text-slate-600 tracking-wider"
              />
            </div>

            {/* UPI ID (Optional) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono tracking-widest uppercase text-slate-400 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" /> UPI ID{" "}
                <span className="text-slate-600 lowercase tracking-normal">
                  (Optional)
                </span>
              </label>
              <input
                type="text"
                name="upi"
                placeholder="e.g. yourname@upi"
                value={form.upi}
                onChange={handleChange}
                className="w-full py-2.5 px-3.5 rounded-lg text-sm text-slate-200 bg-white/3 border border-white/10 outline-none transition-all duration-200 focus:border-blue-500/50 focus:bg-white/5 placeholder:text-slate-600"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono tracking-widest uppercase text-slate-400 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" /> Mobile Number{" "}
              </label>
              <input
                type="text"
                name="mobileNumber"
                placeholder="e.g. 9389619722"
                value={form.mobileNumber}
                onChange={handleChange}
                className="w-full py-2.5 px-3.5 rounded-lg text-sm text-slate-200 bg-white/3 border border-white/10 outline-none transition-all duration-200 focus:border-blue-500/50 focus:bg-white/5 placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* ── Submit Button ── */}
          <div className="pt-5 border-t border-white/5">
            <motion.button
              whileHover={!submitting ? { scale: 1.01 } : {}}
              whileTap={!submitting ? { scale: 0.99 } : {}}
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3 rounded-lg text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-emerald-600 shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Securing Details...
                </>
              ) : (
                "Complete Onboarding"
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
