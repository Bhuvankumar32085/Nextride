"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";
import {
  Bike,
  Car,
  Truck,
  Package,
  CarFront,
  CheckCircle2,
  Loader2,
  Info,
} from "lucide-react";
import { rideApi } from "@/app/axios/rideApi";
import { useAppSelector } from "@/app/redux/hooks";

// Types matching your schema
type VehicleType = "car" | "bike" | "loading" | "truck" | "auto";

const vehicleOptions: {
  type: VehicleType;
  label: string;
  icon: React.ElementType;
}[] = [
  { type: "bike", label: "Bike", icon: Bike },
  { type: "auto", label: "Auto", icon: CarFront },
  { type: "car", label: "Car", icon: Car },
  { type: "loading", label: "Loading", icon: Package },
  { type: "truck", label: "Truck", icon: Truck },
];

export default function OnboardingVehiclePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { loggedUser } = useAppSelector((store) => store.user);
  const [form, setForm] = useState({
    type: "" as VehicleType | "",
    vehcleModel: "",
    number: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTypeSelect = (type: VehicleType) => {
    setForm({ ...form, type });
  };

  const handleSubmit = async () => {
    // if user enbording step is 4 and partner status is verified then uou kan not update the vehicle details
    if (
      loggedUser?.partnerOnboardingSteps === 4 &&
      loggedUser?.partnerStatus === "approved"
    ) {
      return toast.error(
        "Your vehicle details are already approved. Please contact support to make changes.",
      );
    }

    // Validation
    if (!form.type) return toast.error("Please select a vehicle type.");
    if (!form.vehcleModel.trim())
      return toast.error("Please enter the vehicle model.");
    if (!form.number.trim())
      return toast.error("Please enter the vehicle registration number.");

    setSubmitting(true);
    try {
      // NOTE: Update this URL to your actual endpoint
      const res = await rideApi.post("/add-edit-vehicle", form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Token is required to set 'owner' in backend
        },
      });

      toast.success(res.data.message || "Vehicle registered successfully!");

      // Redirect to partner dashboard or waiting page
      router.push("/partner/onboarding/documents");
    } catch (error) {
      console.error("Error registering vehicle:", error);
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to register vehicle.",
        );
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const getVehicleData = async () => {
      try {
        const { data } = await rideApi.get("/vehicle-details", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (data?.data?.vehicle) {
          setForm({
            type: data.data.vehicle.type || "",
            vehcleModel: data.data.vehicle.vehcleModel || "",
            number: data.data.vehicle.number || "",
          });
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(
            error.response?.data?.message || "Failed to get bank details.",
          );
        } else {
          toast.error("An unexpected error occurred.");
        }
      }
    };

    getVehicleData();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#020617] flex items-center justify-center p-4 overflow-hidden font-sans">
      {/* ── Background Floating Orbs ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[100px] -top-20 -left-20 animate-pulse" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[100px] bottom-10 right-10 animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-2xl mx-auto"
      >
        {/* Glow behind card */}
        <div className="absolute -inset-px rounded-[24px] bg-gradient-to-br from-blue-600/30 via-violet-600/10 to-transparent -z-10 blur-sm" />

        <div className="bg-slate-950/90 backdrop-blur-xl rounded-[24px] p-8 md:p-10 border border-white/10 shadow-2xl">
          {/* ── Header ── */}
          <div className="mb-8">
            <span className="inline-block py-1 mr-3 px-2.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-mono tracking-widest uppercase mb-3 border border-blue-500/20">
              Step 1 of 3
            </span>
            <span className="inline-block py-1 px-3 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-semibold tracking-wider uppercase mb-4">
              Partner Onboarding
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
              Register Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
                Vehicle
              </span>
            </h1>
            <p className="text-sm text-slate-400">
              Just a few basic details to get you started on NextRide. You can
              update other details later.
            </p>
          </div>

          <div className="space-y-8">
            {/* ── Field 1: Vehicle Type (Visual Selector) ── */}
            <div>
              <label className="block text-xs font-mono font-medium tracking-widest uppercase text-slate-400 mb-3">
                1. Select Vehicle Type <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {vehicleOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = form.type === option.type;
                  return (
                    <button
                      key={option.type}
                      onClick={() => handleTypeSelect(option.type)}
                      className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                        isSelected
                          ? "bg-blue-500/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                          : "bg-slate-900/50 border-white/5 hover:border-white/20 hover:bg-slate-800/50"
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${isSelected ? "text-blue-400" : "text-slate-500"}`}
                      />
                      <span
                        className={`text-xs font-medium ${isSelected ? "text-blue-400" : "text-slate-400"}`}
                      >
                        {option.label}
                      </span>
                      {isSelected && (
                        <motion.div
                          layoutId="check"
                          className="absolute top-2 right-2"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* ── Field 2: Vehicle Model ── */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono font-medium tracking-widest uppercase text-slate-400">
                  2. Vehicle Model <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="vehcleModel" // Kept exact schema spelling
                    placeholder="e.g. Maruti Suzuki Swift"
                    value={form.vehcleModel}
                    onChange={handleChange}
                    className="w-full py-3 px-4 rounded-xl text-sm text-slate-200 bg-slate-900/70 border border-white/10 outline-none transition-all duration-200 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* ── Field 3: Vehicle Number ── */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono font-medium tracking-widest uppercase text-slate-400">
                  3. Vehicle Number <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="number"
                    placeholder="e.g. UP 16 AB 1234"
                    value={form.number}
                    onChange={handleChange}
                    className="w-full py-3 px-4 rounded-xl text-sm text-slate-200 bg-slate-900/70 border border-white/10 outline-none transition-all duration-200 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-600 uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Information Notice */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400 leading-relaxed">
                By clicking submit, your vehicle profile will be created with a{" "}
                <span className="text-amber-400 font-medium">Pending</span>{" "}
                status. You can upload vehicle photos and set pricing in the
                partner dashboard later.
              </p>
            </div>

            {/* ── Submit Button ── */}
            <motion.button
              whileHover={!submitting ? { scale: 1.01, y: -1 } : {}}
              whileTap={!submitting ? { scale: 0.99 } : {}}
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 shadow-[0_4px_20px_rgba(37,99,235,0.4)] hover:shadow-[0_6px_25px_rgba(37,99,235,0.5)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Registering Vehicle...
                </>
              ) : (
                "Continue to Step 2"
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
