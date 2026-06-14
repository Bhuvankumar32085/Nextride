"use client";

import { authApi } from "@/app/axios/authApi";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { setLoggedUser } from "@/app/redux/selices/userSlices";
import { socket } from "@/realtime/socket";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import axios from "axios";

import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  FileText,
  Loader2,
  Mic,
  ShieldCheck,
  Video,
  Wifi,
  UserCheck,
  BadgeCheck,
  XCircle,
} from "lucide-react";

import { useParams, useRouter } from "next/navigation";

import { use, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const checklistItems = [
  {
    icon: Camera,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    title: "Camera Access",
    desc: "Allow camera permission before joining the session.",
  },

  {
    icon: Mic,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/20",
    title: "Microphone Ready",
    desc: "Make sure your microphone is working properly.",
  },

  {
    icon: Wifi,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
    title: "Stable Internet",
    desc: "Use strong Wi-Fi or mobile internet connection.",
  },

  {
    icon: FileText,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    title: "Documents Ready",
    desc: "Keep Aadhaar, RC, and license nearby.",
  },
];

export default function Page() {
  const { roomId } = useParams();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isRejected, setIsRejected] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const { loggedUser } = useAppSelector((store) => store.user);

  const [isJoined, setIsJoined] = useState(false);

  const [isJoining, setIsJoining] = useState(false);

  const [pendingJoin, setPendingJoin] = useState(false);

  const [permissionError, setPermissionError] = useState("");

  const isAdmin = loggedUser?.role === "admin";

  // /admin/video-kyc/result
  const handleSubmission = async (status: "approved" | "rejected") => {
    setLoading(true);

    try {
      const { data } = await authApi.post(
        "/admin/video-kyc/result",
        {
          roomId,
          status,
          rejectionReason,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (data.success && data.status === "approved") {
        // Handle approval logic here
        toast.success("Partner verification approved successfully.");
        router.push("/");
        // yaha socket event lagega
      } else if (data.success && data.status === "rejected") {
        // Handle rejection logic here
        toast.success("Partner verification rejected successfully.");
        setIsRejected(false);
        setRejectionReason("");
        router.push("/");

        // yaha socket event lagega
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to start KYC.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  // CHECK CAMERA & MIC
  const checkPermissions = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      return true;
    } catch (error) {
      console.error(error);

      setPermissionError(
        "Camera or microphone permission denied. Please allow permissions and reload the page.",
      );

      return false;
    }
  };

  const startCall = async () => {
    setPermissionError("");

    const hasPermission = await checkPermissions();
    setIsCallStarted(true);
    if (!hasPermission) return;

    setIsJoining(true);

    setIsJoined(true);

    setPendingJoin(true);
  };

  useEffect(() => {
    if (!pendingJoin || !containerRef.current) return;

    queueMicrotask(() => {
      setPendingJoin(false);
    });

    const appID = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID);

    const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERCER_URL;

    if (!appID || !serverSecret) {
      console.error("Missing Zego credentials");

      return;
    }

    try {
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        String(roomId),
        String(loggedUser?._id || Date.now()),
        String(loggedUser?.name || "Guest User"),
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);

      zp.joinRoom({
        container: containerRef.current,

        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },

        showPreJoinView: false,

        showScreenSharingButton: false,

        showTextChat: false,

        showLayoutButton: false,

        showLeavingView: false,

        showUserList: false,

        maxUsers: 2,

        layout: "Auto",

        turnOnMicrophoneWhenJoining: true,

        turnOnCameraWhenJoining: true,

        useFrontFacingCamera: true,

        videoResolutionDefault: ZegoUIKitPrebuilt.VideoResolution_360P,

        onLeaveRoom: () => {
          router.push("/");
        },
      });
    } catch (error) {
      console.error(error);

      queueMicrotask(() => {
        setIsJoined(false);

        setIsJoining(false);
      });
    }
  }, [pendingJoin, roomId, loggedUser, router]);

  useEffect(() => {
    socket.on("VIDEO_KYC_RESULT", (payload) => {
      router.refresh(); // Refresh the page to get latest data
      window.location.reload();
      dispatch(setLoggedUser(payload.partner));
    });
    
    socket.on("VIDEO_KYC_RESULT_ADMIN", (payload) => {
      router.refresh(); // Refresh the page to get latest data
      window.location.reload();
    });

    return () => {
      socket.off("VIDEO_KYC_RESULT");
      socket.off("VIDEO_KYC_RESULT_ADMIN");
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#050816] overflow-hidden text-white relative">
      {/* ZEGO ROOM */}
      {isJoined && (
        <div className="fixed inset-0 bg-black z-50">
          <div ref={containerRef} className="w-full h-dvh" />
        </div>
      )}

      {isAdmin && isCallStarted && (
        <>
          <div className=" absolute top-10 right-10 z-50 flex items-center gap-4">
            <button
              onClick={() => handleSubmission("approved")}
              disabled={loading}
              className="group relative overflow-hidden px-2 py-1 md:px-6 md:py-3 md:rounded-2xl rounded-xl bg-linear-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 transition-all duration-300 shadow-[0_8px_30px_rgba(16,185,129,0.35)] hover:scale-[1.03] active:scale-[0.98] flex items-center gap-2 md:font-semibold text-white"
            >
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/20 to-transparent" />

              <CheckCircle2 className="md:w-5 md:h-5 w-3 h-3 relative z-10" />

              <span className="relative z-10 text-sm">Approve</span>
            </button>

            <button
              onClick={() => {
                setIsRejected(true);
              }}
              disabled={loading}
              className="group relative overflow-hidden px-2 py-1 md:px-6 md:py-3 md:rounded-2xl rounded-xl bg-linear-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 transition-all duration-300 shadow-[0_8px_30px_rgba(239,68,68,0.35)] hover:scale-[1.03] active:scale-[0.98] flex items-center gap-2 md:font-semibold text-white"
            >
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/20 to-transparent" />

              <XCircle className="md:w-5 md:h-5 w-3 h-3 relative z-10" />

              <span className="relative z-10 text-sm">Reject</span>
            </button>
          </div>
        </>
      )}

      {isRejected && isAdmin && (
        <div className="fixed inset-0 z-999 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl border border-red-500/20 bg-[#0f172a] shadow-[0_20px_80px_rgba(0,0,0,0.6)] overflow-hidden">
            {/* TOP BAR */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Reject Verification
                </h2>

                <p className="text-sm text-slate-400 mt-1">
                  Provide a reason for rejection
                </p>
              </div>
            </div>

            {/* BODY */}
            <div className="p-6">
              <label className="text-sm font-medium text-slate-300 mb-3 block">
                Rejection Reason
              </label>

              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full min-h-35 rounded-2xl border border-white/10 bg-white/3 px-4 py-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-red-500/40 focus:ring-2 focus:ring-red-500/20 transition-all resize-none"
              />

              {/* ACTION BUTTONS */}
              <div className="mt-6 flex items-center justify-end gap-4">
                {/* CANCEL */}
                <button
                  onClick={() => {
                    setRejectionReason("");
                    setIsRejected(false);
                  }}
                  className="px-5 py-3 rounded-2xl border border-white/10 bg-white/3 hover:bg-white/6 transition-all duration-300 text-slate-300 font-medium"
                >
                  Cancel
                </button>

                {/* REJECT */}
                <button
                  onClick={() => handleSubmission("rejected")}
                  disabled={loading}
                  className="group relative overflow-hidden px-6 py-3 rounded-2xl bg-linear-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 transition-all duration-300 shadow-[0_8px_30px_rgba(239,68,68,0.35)] hover:scale-[1.03] active:scale-[0.98] flex items-center gap-2 font-semibold text-white"
                >
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/20 to-transparent" />
                  Reject Partner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRE JOIN UI */}
      {!isJoined && (
        <>
          {/* BACKGROUND */}
          <div className="absolute -top-50 -left-50 w-112.5 h-112.5 rounded-full bg-cyan-500/10 blur-[120px]" />

          <div className="absolute -bottom-50 -right-50 w-112.5 h-112.5 rounded-full bg-blue-500/10 blur-[120px]" />

          {/* CONTENT */}
          <div className="relative z-10 min-h-screen px-4 py-8 flex items-center justify-center">
            <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-10 items-center">
              {/* LEFT SIDE */}
              <div>
                {/* BACK BUTTON */}
                <button
                  onClick={() => router.back()}
                  className="mb-8 flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/3 hover:bg-white/6 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />

                  <span className="text-sm">Back</span>
                </button>

                {/* LIVE BADGE */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-medium mb-6">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

                  {isAdmin
                    ? "Partner Ready For Verification"
                    : "Admin Ready For Verification"}
                </div>

                {/* TITLE */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
                  {isAdmin ? (
                    <>
                      Partner{" "}
                      <span className="bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        Verification
                      </span>
                    </>
                  ) : (
                    <>
                      Secure{" "}
                      <span className="bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        Video KYC
                      </span>
                    </>
                  )}
                </h1>

                {/* DESCRIPTION */}
                <p className="mt-6 text-slate-400 text-lg leading-relaxed max-w-2xl">
                  {isAdmin
                    ? "Verify partner identity and documents securely through live video verification."
                    : "Complete your final partner verification securely with a live video session."}
                </p>

                {/* ADMIN UI */}
                {isAdmin ? (
                  <div className="mt-10 space-y-4">
                    <div className="p-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 flex gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-black/20 text-cyan-400">
                        <UserCheck className="w-6 h-6" />
                      </div>

                      <div>
                        <h3 className="font-semibold text-white">
                          Verify Partner Identity
                        </h3>

                        <p className="text-sm text-slate-400 mt-1">
                          Match partner face with uploaded documents.
                        </p>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 flex gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-black/20 text-emerald-400">
                        <BadgeCheck className="w-6 h-6" />
                      </div>

                      <div>
                        <h3 className="font-semibold text-white">
                          Approval Session
                        </h3>

                        <p className="text-sm text-slate-400 mt-1">
                          Approve or reject partner after successful
                          verification.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* PARTNER UI */
                  <div className="mt-10 space-y-4">
                    {checklistItems.map((item, index) => {
                      const Icon = item.icon;

                      return (
                        <div
                          key={index}
                          className={`p-5 rounded-2xl border ${item.border} ${item.bg} flex gap-4`}
                        >
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center bg-black/20 ${item.color}`}
                          >
                            <Icon className="w-6 h-6" />
                          </div>

                          <div>
                            <h3 className="font-semibold text-white">
                              {item.title}
                            </h3>

                            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* RIGHT SIDE */}
              <div>
                <div className="relative rounded-4xl overflow-hidden border border-white/10 bg-[#0f172a]/80 backdrop-blur-3xl shadow-[0_20px_80px_rgba(15,23,42,0.8)]">
                  {/* TOP LINE */}
                  <div className="absolute top-0 inset-x-0 h-0.5 bg-linear-to-r from-cyan-400 via-blue-500 to-indigo-500" />

                  <div className="p-6 sm:p-8">
                    {/* HEADER */}
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-2xl font-bold">
                          Verification Room
                        </h2>

                        <p className="text-sm text-slate-400 mt-1">
                          Secure live session
                        </p>
                      </div>

                      <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <ShieldCheck className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* PREVIEW */}
                    <div className="relative h-60 rounded-3xl border border-white/10 bg-black/40 overflow-hidden flex items-center justify-center mb-8">
                      <div className="absolute inset-0 bg-linear-to-br from-cyan-500/10 to-blue-500/10" />

                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full bg-white/10 border border-white/10 flex items-center justify-center mb-4">
                          <Camera className="w-12 h-12 text-slate-300" />
                        </div>

                        <p className="text-sm text-slate-400">
                          Camera preview will appear here
                        </p>
                      </div>
                    </div>
                    {/* ZegoRoomLeaveButton */}
                    {/* ROOM INFO */}
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">
                          Participant
                        </span>

                        <span className="font-semibold">
                          {loggedUser?.name}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-slate-500">Room ID</span>

                        <span className="text-sm font-mono text-cyan-400 break-all">
                          {roomId}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">
                          Session Type
                        </span>

                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
                          <Video className="w-4 h-4" />
                          One-to-One KYC
                        </span>
                      </div>
                    </div>

                    {/* SECURITY */}
                    <div className="mt-8 p-4 rounded-2xl bg-blue-500/8 border border-blue-500/20 flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />

                      <p className="text-xs text-blue-200/80 leading-relaxed">
                        {isAdmin
                          ? "You are securely connected to the partner verification room."
                          : "Your session is securely encrypted and monitored for compliance."}
                      </p>
                    </div>

                    {/* ERROR */}
                    {permissionError && (
                      <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                        {permissionError}
                      </div>
                    )}

                    {/* BUTTON */}
                    <button
                      onClick={startCall}
                      disabled={isJoining}
                      className="mt-8 relative overflow-hidden w-full rounded-2xl py-4 px-6 bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 transition-all duration-300 shadow-[0_4px_24px_rgba(59,130,246,0.35)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                    >
                      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/20 to-transparent" />

                      {isJoining ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />

                          <span className="font-bold text-base">
                            Connecting Securely...
                          </span>
                        </>
                      ) : (
                        <>
                          <Video className="w-5 h-5" />

                          <span className="font-bold text-base">
                            {isAdmin
                              ? "Start Verification"
                              : "Join Verification"}
                          </span>
                        </>
                      )}
                    </button>

                    {/* FOOTER */}
                    <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Trusted encrypted video verification
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
