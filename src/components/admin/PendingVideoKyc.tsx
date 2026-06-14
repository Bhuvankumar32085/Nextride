"use client";

import {
  Car,
  CheckCircle2,
  Eye,
  LucideIcon,
  PlayCircle,
  Video,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { authApi } from "@/app/axios/authApi";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Image from "next/image";
import { IUser } from "@/app/types";
import { useRouter } from "next/navigation";
import { socket } from "@/realtime/socket";

export const PendingVideoKyc = ({
  title,
  desc,
  icon: Icon,
}: {
  title: string;
  desc: string;
  icon: LucideIcon;
}) => {
  const [pendingVideoKycPartners, setPendingVideoKycPartners] = useState<
    IUser[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [startingKycId, setStartingKycId] = useState<string | null>(null);
  const router = useRouter();

  // ── Fetch Initial Data ──
  const fetchPendingVideoKycPartners = async () => {
    setLoading(true);
    try {
      const { data } = await authApi.get("/admin/pending-video-kyc", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (data.success) {
        setPendingVideoKycPartners(data.data.partners);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to fetch data.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingVideoKycPartners();
  }, []);

  useEffect(() => {
    socket.on("VIDEO_KYC_REAPPLY", (payload) => {
      fetchPendingVideoKycPartners();
    });
    socket.on("VIDEO_KYC_STARTED", (payload) => {
      fetchPendingVideoKycPartners();
    });

    return () => {
      socket.off("VIDEO_KYC_REAPPLY");
      socket.off("VIDEO_KYC_STARTED");
    };
  }, []);

  // ── Handle Start KYC Button ──
  const handleStartKyc = async (partnerId: string) => {
    setStartingKycId(partnerId);
    try {
      const { data } = await authApi.patch(
        "/admin/video-kyc/start",
        { partnerId: partnerId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (data.success) {
        // Update state locally to immediately reflect the 'in_progress' status
        setPendingVideoKycPartners((prev) =>
          prev.map((partner) =>
            partner._id === partnerId
              ? { ...partner, videoKycStatus: "in_progress" }
              : partner,
          ),
        );
        toast.success("Video KYC Started Successfully!");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to start KYC.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setStartingKycId(null);
    }
  };

  if (loading) {
    return (
      <div className="mt-4 bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-3xl p-5 md:p-8 flex items-center justify-center min-h-[400px] shadow-2xl overflow-hidden relative">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
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

      {!pendingVideoKycPartners || pendingVideoKycPartners.length === 0 ? (
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
          {/* 📱 MOBILE VIEW (CARDS) absolute*/}
          <div
            className="md:hidden flex flex-col gap-4 max-h-[450px] overflow-y-auto pr-1
                  [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent 
                  [&::-webkit-scrollbar-thumb]:bg-slate-700 hover:[&::-webkit-scrollbar-thumb]:bg-slate-600 
                  [&::-webkit-scrollbar-thumb]:rounded-full"
          >
            {pendingVideoKycPartners.map((partner, index) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={partner._id}
                className="bg-white/[0.03] border  border-white/5 rounded-2xl p-4 flex flex-col gap-4"
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
                      <span className="bg-gradient-to-br from-blue-400 to-indigo-400 text-transparent bg-clip-text uppercase">
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

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/5 pt-3 mt-1 w-full">
                  {/* Start KYC / In Progress Logic for Mobile */}
                  {partner.videoKycStatus === "pending" ? (
                    <button
                      onClick={() => handleStartKyc(partner._id)}
                      disabled={startingKycId === partner._id}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold bg-blue-500 text-slate-950 hover:bg-blue-400 transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50"
                    >
                      {startingKycId === partner._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <PlayCircle className="w-4 h-4" />
                      )}
                      Start KYC
                    </button>
                  ) : partner.videoKycStatus === "in_progress" ? (
                    <div
                      onClick={() =>
                        router.push(`/video-kyc/${partner.videoKycRoomId}`)
                      }
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center gap-2 cursor-default"
                    >
                      <Video className="w-4 h-4 animate-pulse" />
                      Join call
                    </div>
                  ) : null}
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
                    <th className="p-5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {pendingVideoKycPartners.map((partner, index) => (
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
                              <span className="bg-gradient-to-br from-blue-400 to-indigo-400 text-transparent bg-clip-text uppercase">
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

                      <td className="p-4 md:p-5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {/* Start KYC / In Progress Logic for Desktop */}
                          {partner.videoKycStatus === "pending" ? (
                            <button
                              onClick={() => handleStartKyc(partner._id)}
                              disabled={startingKycId === partner._id}
                              className="px-4 py-2 rounded-xl font-bold bg-blue-500 text-slate-950 hover:bg-blue-400 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50"
                            >
                              {startingKycId === partner._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <PlayCircle className="w-4 h-4" />
                              )}
                              Start KYC
                            </button>
                          ) : partner.videoKycStatus === "in_progress" ? (
                            <div
                              onClick={() =>
                                router.push(
                                  `/video-kyc/${partner.videoKycRoomId}`,
                                )
                              }
                              className="px-4 py-2 rounded-xl font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-2 cursor-default"
                            >
                              <Video className="w-4 h-4 animate-pulse" />
                              Join call
                            </div>
                          ) : null}
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
  );
};
