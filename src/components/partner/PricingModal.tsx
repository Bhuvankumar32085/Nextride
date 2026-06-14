"use client";

import { rideApi } from "@/app/axios/rideApi";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { setLoggedUser } from "@/app/redux/selices/userSlices";
import axios from "axios";
import { motion } from "framer-motion";
import {
  X,
  IndianRupee,
  Clock,
  MapPin,
  Navigation,
  Camera,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, use, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface PricingModalProps {
  setShowPricing: Dispatch<SetStateAction<boolean>>;
}

interface FormData {
  baseFare: string | number;
  pricePerKM: string | number;
  waitingCharge: string | number;
}

export default function PricingModal({ setShowPricing }: PricingModalProps) {
  const [formData, setFormData] = useState<FormData>({
    baseFare: "",
    pricePerKM: "",
    waitingCharge: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

  const { loggedUser } = useAppSelector((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (
      loggedUser &&
      loggedUser.role !== "partner" &&
      loggedUser.partnerOnboardingSteps !== 5
    ) {
      router.push("/");
    }
  }, [loggedUser, router]);

  useEffect(() => {
    const fetchExistingDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await rideApi.get("/vehicle-details", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (data.data) {
          const { baseFare, pricePerKM, waitingCharge, vehiclePhoto } =
            data.data.vehicle;
          setFormData({
            baseFare: baseFare || "",
            pricePerKM: pricePerKM || "",
            waitingCharge: waitingCharge || "",
          });
          if (vehiclePhoto && vehiclePhoto.url) {
            setImagePreview(vehiclePhoto.url);
          }
        }
      } catch (error) {
        console.error("Failed to fetch existing details:", error);
      }
    };

    fetchExistingDetails();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSavePricing = async () => {
    if (!formData.baseFare || !formData.pricePerKM || !formData.waitingCharge) {
      toast.error("Please fill in all fares.");
      return;
    }

    const token = localStorage.getItem("token");

    const payload = new FormData();
    payload.append("baseFare", formData.baseFare.toString());
    payload.append("pricePerKM", formData.pricePerKM.toString());
    payload.append("waitingCharge", formData.waitingCharge.toString());
    if (imageFile) {
      payload.append("vehiclePhoto", imageFile!);
    }

    setIsLoading(true);
    try {
      const { data } = await rideApi.post(
        "/add-edit-partner-price-details",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (data.success) {
        toast.success("Setup complete!");
        setShowPricing(false);

        dispatch(setLoggedUser({ ...loggedUser, partnerOnboardingSteps: 6 }));
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("API error response:", error.response);
        toast.error(error.response?.data?.message || "Failed to save details.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-[360px] bg-[#0f172a] rounded-[28px] shadow-2xl flex flex-col overflow-hidden border border-white/10"
      >
        {/* ── Close Button (Floating) ── */}
        <button
          onClick={() => setShowPricing(false)}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/40 backdrop-blur-md text-white/70 hover:text-white hover:bg-black/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ── Cover Image Uploader (Saves Vertical Space) ── */}
        <div className="relative h-36 w-full bg-slate-800 group cursor-pointer overflow-hidden">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />

          {imagePreview ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Vehicle"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-0">
                <p className="text-white text-xs font-semibold flex items-center gap-1.5">
                  <Camera className="w-4 h-4" /> Change Photo
                </p>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 group-hover:from-slate-700 group-hover:to-slate-800 transition-colors">
              <Camera className="w-8 h-8 text-slate-400 mb-2 group-hover:text-emerald-400 transition-colors" />
              <span className="text-sm font-semibold text-slate-300">
                Tap to upload vehicle photo
              </span>
            </div>
          )}
        </div>

        <div className="px-5 pt-5 pb-6">
          {/* Header Text */}
          <div className="mb-5 text-center">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Pricing Setup
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Define your earning rates per trip
            </p>
          </div>

          {/* ── Compact iOS Style Inputs ── */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden flex flex-col">
            {/* Base Fare */}
            <div className="flex items-center justify-between p-3.5 border-b border-white/5 focus-within:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-slate-200">
                  Base Fare
                </span>
              </div>
              <div className="flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-slate-500" />
                <input
                  type="number"
                  name="baseFare"
                  value={formData.baseFare}
                  onChange={handleChange}
                  placeholder="50"
                  className="w-16 bg-transparent text-right text-white font-bold text-base outline-none placeholder:text-slate-600 placeholder:font-normal"
                />
              </div>
            </div>

            {/* Price Per KM */}
            <div className="flex items-center justify-between p-3.5 border-b border-white/5 focus-within:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Navigation className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-slate-200">
                  Per KM
                </span>
              </div>
              <div className="flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-slate-500" />
                <input
                  type="number"
                  name="pricePerKM"
                  value={formData.pricePerKM}
                  onChange={handleChange}
                  placeholder="12"
                  className="w-16 bg-transparent text-right text-white font-bold text-base outline-none placeholder:text-slate-600 placeholder:font-normal"
                />
              </div>
            </div>

            {/* Waiting Charge */}
            <div className="flex items-center justify-between p-3.5 focus-within:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-slate-200">
                  Wait / Min
                </span>
              </div>
              <div className="flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-slate-500" />
                <input
                  type="number"
                  name="waitingCharge"
                  value={formData.waitingCharge}
                  onChange={handleChange}
                  placeholder="2"
                  className="w-16 bg-transparent text-right text-white font-bold text-base outline-none placeholder:text-slate-600 placeholder:font-normal"
                />
              </div>
            </div>
          </div>

          {/* ── Action Button ── */}
          <button
            onClick={handleSavePricing}
            disabled={
              isLoading ||
              !formData.baseFare ||
              !formData.pricePerKM ||
              !formData.waitingCharge ||
              (!imageFile && !imagePreview) // require either new image or existing preview
            }
            className="mt-6 w-full rounded-xl py-3.5 bg-white text-black font-bold text-sm hover:bg-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Confirm Details
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
