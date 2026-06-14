"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";
import {
  UploadCloud,
  CheckCircle2,
  X,
  Loader2,
  ShieldCheck,
  CreditCard,
  FileBadge,
} from "lucide-react";
import { rideApi } from "@/app/axios/rideApi";
import { useAppSelector } from "@/app/redux/hooks";

type DocType = "aadhar" | "rc" | "license";

interface UploadedFile {
  file: File;
  previewUrl: string;
}

export default function OnboardingDocumentsPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { loggedUser } = useAppSelector((store) => store.user);
  const [docs, setDocs] = useState<{ [key in DocType]: UploadedFile | null }>({
    aadhar: null,
    rc: null,
    license: null,
  });

  const fileInputRefs = {
    aadhar: useRef<HTMLInputElement>(null),
    rc: useRef<HTMLInputElement>(null),
    license: useRef<HTMLInputElement>(null),
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: DocType,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.includes("image") && file.type !== "application/pdf") {
        toast.error("Please upload an image or PDF file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB.");
        return;
      }
      setDocs((prev) => ({
        ...prev,
        [type]: {
          file,
          previewUrl: URL.createObjectURL(file),
        },
      }));
    }
  };

  const removeFile = (type: DocType) => {
    setDocs((prev) => {
      const newDocs = { ...prev };
      if (newDocs[type]?.previewUrl) {
        URL.revokeObjectURL(newDocs[type]!.previewUrl);
      }
      newDocs[type] = null;
      return newDocs;
    });

    if (fileInputRefs[type].current) {
      fileInputRefs[type].current!.value = "";
    }
  };

  const handleSubmit = async () => {
    // if user enbording step is 4 and partner status is verified then uou kan not update the vehicle details
    if (
      loggedUser?.partnerOnboardingSteps === 4 &&
      loggedUser?.partnerStatus === "approved"
    ) {
      return toast.error(
        "Your document details are already approved. Please contact support to make changes.",
      );
    }

    if (!docs.aadhar || !docs.rc || !docs.license) {
      return toast.error("Please upload all documents to proceed.");
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("aadharCard", docs.aadhar.file);
      formData.append("rc", docs.rc.file);
      formData.append("license", docs.license.file);

      await rideApi.post("/add-documents", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Documents uploaded successfully! 🎉");
      // Redirect to Step 3 or Dashboard
      router.push("/partner/onboarding/bank");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to upload documents.",
        );
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Ultra Compact Upload Row ──
  const UploadRow = ({
    type,
    title,
    icon: Icon,
    desc,
  }: {
    type: DocType;
    title: string;
    icon: React.ElementType;
    desc: string;
  }) => {
    const uploaded = docs[type];

    return (
      <div
        className={`p-3.5 mb-3 rounded-xl border transition-all duration-200 flex items-center justify-between gap-3 ${uploaded ? "bg-emerald-500/5 border-emerald-500/20" : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"}`}
      >
        {/* Left: Icon & Text */}
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className={`p-2 rounded-lg shrink-0 ${uploaded ? "text-emerald-400 bg-emerald-500/10" : "text-slate-400 bg-white/5"}`}
          >
            <Icon className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h3 className="text-sm font-semibold text-slate-200 truncate">
              {title}
            </h3>
            {uploaded ? (
              <p className="text-[10px] text-emerald-400/80 truncate flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" /> Uploaded successfully
              </p>
            ) : (
              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                {desc}
              </p>
            )}
          </div>
        </div>

        {/* Right: Action Button */}
        <div className="shrink-0 ml-2">
          {uploaded ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-[10px] text-slate-400 max-w-[80px] truncate bg-white/5 px-2 py-1 rounded border border-white/10">
                {uploaded.file.name}
              </span>
              <button
                onClick={() => removeFile(type)}
                className="p-1.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                title="Remove"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRefs[type].current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-[11px] font-medium transition-colors shadow-sm"
            >
              <UploadCloud className="w-3 h-3" />
              Upload
            </button>
          )}

          <input
            type="file"
            ref={fileInputRefs[type]}
            onChange={(e) => handleFileChange(e, type)}
            accept="image/png, image/jpeg, application/pdf"
            className="hidden"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-[#020617] flex items-center justify-center p-4 overflow-hidden font-sans">
      {/* ── Background Orbs ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[300px] h-[300px] rounded-full bg-emerald-600/10 blur-[100px] top-10 left-10 animate-pulse" />
        <div className="absolute w-[300px] h-[300px] rounded-full bg-blue-600/10 blur-[100px] bottom-10 right-10 animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg mx-auto" /* Reduced to max-w-lg for a smaller card */
      >
        <div className="absolute -inset-px rounded-[20px] bg-gradient-to-br from-blue-600/20 via-emerald-600/10 to-transparent -z-10 blur-sm" />

        {/* Compact padding */}
        <div className="bg-slate-950/90 backdrop-blur-2xl rounded-[20px] p-6 md:p-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* ── Header ── */}
          <div className="mb-6">
            <span className="inline-block py-1 px-2.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-mono tracking-widest uppercase mb-3 border border-blue-500/20">
              Step 2 of 3
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-1.5">
              Verify Documents
            </h1>
            <p className="text-xs text-slate-400">
              Upload clear images (JPG/PNG) .
            </p>
          </div>

          <div className="mt-6 mb-6">
            {/* ── Compact Upload Rows ── */}
            <UploadRow
              type="aadhar"
              title="Aadhar Card"
              desc="Front & back in one file"
              icon={CreditCard}
            />
            <UploadRow
              type="rc"
              title="Vehicle RC"
              desc="Registration Certificate"
              icon={FileBadge}
            />
            <UploadRow
              type="license"
              title="Driving License"
              desc="Valid permanent license"
              icon={ShieldCheck}
            />
          </div>

          {/* ── Submit Button ── */}
          <div className="pt-4 border-t border-white/5">
            <motion.button
              whileHover={!submitting ? { scale: 1.01 } : {}}
              whileTap={!submitting ? { scale: 0.99 } : {}}
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-emerald-600 shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Continue to Step 3"
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
