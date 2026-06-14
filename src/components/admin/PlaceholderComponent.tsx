"use client";

import {
  LucideIcon,
  CheckCircle2,
  XCircle,
  Car,
  Eye,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { rideApi } from "@/app/axios/rideApi";
import { Dispatch, SetStateAction, useState } from "react";
import { PartnerDetailsModal } from "./PartnerDetailsModal"; // <--- Import the new component
import Image from "next/image";
import { authApi } from "@/app/axios/authApi";

import { IDashboardData } from "./AdminDashboard";

// ── TypeScript Interfaces ──
export interface IPendingPartner {
  _id: string;
  name: string;
  email: string;
  image?: string;
  vehicleType: string;
}

export type AdminPartnerDetails = {
  user: {
    _id: string;
    name: string;
    email: string;
    image: string;
    mobileNumber: string;
    role: "user" | "partner" | "admin";
    partnerStatus: "pending" | "approved" | "rejected";
    createdAt: string;
  };

  documents: {
    _id: string;
    owner: string;

    aadharCardUrl: {
      public_id: string;
      url: string;
    };

    rcUrl: {
      public_id: string;
      url: string;
    };

    licenseUrl: {
      public_id: string;
      url: string;
    };

    status: string;

    createdAt: string;
    updatedAt: string;
  };

  bank: {
    _id: string;
    owner: string;

    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    upi?: string;

    status: string;

    createdAt: string;
    updatedAt: string;
  };

  vehicle: {
    _id: string;
    owner: string;

    type: string;
    vehcleModel: string;
    number: string;

    status: string;

    isActive: boolean;

    pricePerKM: number;
    waitingCharge: number;

    createdAt: string;
    updatedAt: string;
  };
};

// ── Placeholder Component ──
export const PlaceholderComponent = ({
  title,
  desc,
  icon: Icon,
  data,
  setData,
}: {
  title: string;
  desc: string;
  icon: LucideIcon;
  data?: IPendingPartner[];
  setData: Dispatch<SetStateAction<IDashboardData | null>>;
}) => {
  const [loadingProfileId, setLoadingProfileId] = useState<string | null>(null);
  const [changeStatusLoading, setChangeStatusLoading] =
    useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<AdminPartnerDetails | null>(
    null,
  );

  // API Call to fetch full details
  const fetchAdminDashboardData = async (user_id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoadingProfileId(user_id);

    try {
      const response = await rideApi.get(
        `/admin/partner-full-details/${user_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        setUserProfile(response.data.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to fetch data.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoadingProfileId(null);
    }
  };

  const closeModal = () => setUserProfile(null);

  const handleChangeStatus = async (
    partnerId: string,
    newStatus: "approved" | "rejected",
    rejectedReason?: string,
  ) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setChangeStatusLoading(true);

    try {
      const response = await authApi.post(
        `/admin/partner-review/${partnerId}`,
        { action: newStatus, reason: rejectedReason },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.data.success) {
        toast.success(
          `Partner ${newStatus === "approved" ? "approved" : "rejected"} successfully!`,
        );
        // Optionally, refresh the list or update the UI accordingly
        if (newStatus === "approved") {
          setData((prev) => {
            if (!prev) return prev;

            return {
              ...prev,

              pendingPartner: prev.pendingPartner.filter(
                (p) => p._id !== partnerId,
              ),

              approvedPartners: prev.approvedPartners + 1,

              pendingPartners: prev.pendingPartners - 1,
            };
          });
        } else if (newStatus === "rejected") {
          // if rejected remove from pending and add to rejected count
          setData((prev) => {
            if (!prev) return prev;

            return {
              ...prev,
              pendingPartner: prev.pendingPartner.filter(
                (p) => p._id !== partnerId,
              ),
              rejectedPartners: prev.rejectedPartners + 1,
              pendingPartners: prev.pendingPartners - 1,
            };
          });
        }

        closeModal();
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to update status.",
        );
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setChangeStatusLoading(false);
    }
  };

  return (
    <>
      <div className="mt-4 bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-3xl p-5 md:p-8 flex flex-col min-h-[400px] shadow-2xl overflow-hidden relative">
        {/* ── Component Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8 border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.15)] shrink-0">
              <Icon className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                {title}
              </h2>
              <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-lg">
                {desc}
              </p>
            </div>
          </div>
        </div>

        {/* 1. Pending Partner Reviews View */}
        {title === "Pending Partner Reviews" && (
          <div className="flex-1 flex flex-col">
            {!data || data.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full flex-1 min-h-[300px]">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-5">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <p className="text-xl font-bold text-white">All Caught Up!</p>
                <p className="text-sm text-slate-400 mt-2">
                  No pending partner reviews at the moment.
                </p>
              </div>
            ) : (
              <>
                {/* 📱 MOBILE VIEW (CARDS) */}
                <div
                  className="md:hidden flex flex-col gap-4 max-h-[450px] overflow-y-auto pr-1
                  [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent 
                  [&::-webkit-scrollbar-thumb]:bg-slate-700 hover:[&::-webkit-scrollbar-thumb]:bg-slate-600 
                  [&::-webkit-scrollbar-thumb]:rounded-full"
                >
                  {data.map((partner, index) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={partner._id}
                      className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex flex-col gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center text-lg font-bold text-white overflow-hidden shrink-0 shadow-lg">
                          {partner.image ? (
                            <Image
                              src={partner.image}
                              alt={partner.name}
                              className="w-full h-full object-cover"
                              width={48}
                              height={48}
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="bg-linear-to-br from-blue-400 to-indigo-400 text-transparent bg-clip-text uppercase">
                              {partner.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white capitalize truncate">
                            {partner.name}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">
                            {partner.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
                          <Car className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="text-[11px] font-semibold text-slate-300 capitalize">
                            {partner.vehicleType}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1.5 rounded-lg">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span className="text-[10px] text-emerald-400 font-medium">
                            Aadhar
                          </span>
                        </div>
                        <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1.5 rounded-lg">
                          <FileText className="w-3 h-3 text-emerald-400" />
                          <span className="text-[10px] text-emerald-400 font-medium">
                            License
                          </span>
                        </div>
                        <div className="flex items-center gap-1  bg-emerald-500/10 border border-emerald-500/20 px-2 py-1.5 rounded-lg relative">
                          <FileText className="w-3 h-3 text-emerald-400" />
                          <span className="text-[10px] text-emerald-400 font-medium">
                            Bank
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1">
                        <button
                          onClick={() => fetchAdminDashboardData(partner._id)}
                          className="p-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors flex items-center justify-center"
                          disabled={loadingProfileId === partner._id}
                        >
                          {loadingProfileId === partner._id ? (
                            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <Eye className="w-4 h-4" />
                              <span className="pl-3">View Details</span>
                            </>
                          )}
                        </button>
                        {/* <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleChangeStatus(partner._id, "rejected")
                            }
                            disabled={changeStatusLoading}
                            className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors text-xs font-bold border border-transparent hover:border-rose-500/30"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() =>
                              handleChangeStatus(partner._id, "approved")
                            }
                            disabled={changeStatusLoading}
                            className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors text-xs font-bold border border-transparent hover:border-emerald-500/30"
                          >
                            Approve
                          </button>
                        </div> */}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* 💻 DESKTOP VIEW (TABLE) */}
                <div className="hidden md:block rounded-2xl border border-white/10 bg-black/20 w-full">
                  <div
                    className="max-h-[450px] overflow-y-auto w-full 
                    [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent 
                    [&::-webkit-scrollbar-thumb]:bg-slate-700 hover:[&::-webkit-scrollbar-thumb]:bg-slate-600 
                    [&::-webkit-scrollbar-thumb]:rounded-full"
                  >
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead className="bg-white/[0.04] sticky top-0 z-10 backdrop-blur-md">
                        <tr className="border-b border-white/10 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                          <th className="p-5 font-medium">Partner Profile</th>
                          <th className="p-5 font-medium">Vehicle Info</th>
                          <th className="p-5 font-medium">Documents Status</th>
                          <th className="p-5 font-medium text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {data.map((partner, index) => (
                          <motion.tr
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            key={partner._id}
                            className="group hover:bg-white/[0.03] transition-all"
                          >
                            <td className="p-4 md:p-5">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center text-lg font-bold text-white overflow-hidden shrink-0 shadow-lg">
                                  {partner.image ? (
                                    <Image
                                      src={partner.image}
                                      alt={partner.name}
                                      className="w-full h-full object-cover"
                                      width={48}
                                      height={48}
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <span className="bg-linear-to-br from-blue-400 to-indigo-400 text-transparent bg-clip-text uppercase">
                                      {partner.name.charAt(0)}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-white capitalize">
                                    {partner.name}
                                  </p>
                                  <p className="text-xs text-slate-400 mt-0.5 truncate max-w-45">
                                    {partner.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 md:p-5">
                              <div className="inline-flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                <Car className="w-4 h-4 text-cyan-400" />
                                <span className="text-xs font-semibold text-slate-300 capitalize">
                                  {partner.vehicleType}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 md:p-5">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-[10px] text-emerald-400 font-medium">
                                    Aadhar
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md">
                                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-[10px] text-emerald-400 font-medium">
                                    License
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md relative">
                                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-[10px] text-emerald-400 font-medium">
                                    Bank
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 md:p-5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() =>
                                    fetchAdminDashboardData(partner._id)
                                  }
                                  className="p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors flex items-center justify-center w-10 h-10"
                                  title="View Full Profile"
                                  disabled={loadingProfileId === partner._id}
                                >
                                  {loadingProfileId === partner._id ? (
                                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* 2. Pending Video KYC View */}
        {title === "Pending Video KYC" && (
          <div className="flex flex-col items-center justify-center flex-1 min-h-75 text-center">
            <div className="w-20 h-20 bg-blue-500/5 rounded-full flex items-center justify-center mb-6">
              <Icon className="w-10 h-10 text-blue-500/50" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Video Verification Portal
            </h3>
            <p className="text-sm text-slate-400 max-w-md">
              The live video KYC and face-matching interface will be integrated
              in this section.
            </p>
          </div>
        )}

        {/* 3. Pending Vehicle Reviews View */}
        {title === "Pending Vehicle Reviews" && (
          <div className="flex flex-col items-center justify-center flex-1 min-h-[300px] text-center">
            <div className="w-20 h-20 bg-blue-500/5 rounded-full flex items-center justify-center mb-6">
              <Icon className="w-10 h-10 text-blue-500/50" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Vehicle Inspection
            </h3>
            <p className="text-sm text-slate-400 max-w-md">
              Verify RC books, vehicle photos, and insurance details from this
              dedicated interface.
            </p>
          </div>
        )}
      </div>

      {/* ── Extracted Pop-Up Modal Component ── */}
      <AnimatePresence>
        {userProfile && (
          <PartnerDetailsModal
            userProfile={userProfile}
            onClose={closeModal}
            handleChangeStatus={handleChangeStatus}
            changeStatusLoading={changeStatusLoading}
          />
        )}
      </AnimatePresence>
    </>
  );
};
