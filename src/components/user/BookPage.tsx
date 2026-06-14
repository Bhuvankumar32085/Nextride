"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants, number } from "framer-motion";
import {
  Bike,
  CarFront,
  Car,
  Package,
  Truck,
  Phone,
  CheckCircle2,
  ArrowRight,
  LocateFixed,
  Zap,
  ArrowLeft, // Added for back button
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// --- Vehicle Data ---
const vehicles = [
  {
    id: 1,
    type: "bike",
    name: "Next Bike",
    icon: Bike,
    desc: "Quickest option. Perfect for solo rides.",
    color: "text-cyan-400",
    bg: "bg-cyan-500",
    border: "border-cyan-500/50",
    glow: "bg-cyan-500/10",
  },
  {
    id: 2,
    type: "auto",
    name: "Next Auto",
    icon: CarFront,
    desc: "Economical and breezy. Perfect for city travel.",
    color: "text-emerald-400",
    bg: "bg-emerald-500",
    border: "border-emerald-500/50",
    glow: "bg-emerald-500/10",
  },
  {
    id: 3,
    type: "car",
    name: "Next Mini",
    icon: Car,
    desc: "Comfortable rides for daily commute.",
    color: "text-blue-400",
    bg: "bg-blue-500",
    border: "border-blue-500/50",
    glow: "bg-blue-500/10",
  },
  {
    id: 4,
    type: "loading",
    name: "Next Load",
    icon: Package,
    desc: "Commercial vehicles for moving goods.",
    color: "text-orange-400",
    bg: "bg-orange-500",
    border: "border-orange-500/50",
    glow: "bg-orange-500/10",
  },
  {
    id: 5,
    type: "truck",
    name: "Next Truck",
    icon: Truck,
    desc: "Heavy transport for large-scale logistics.",
    color: "text-rose-400",
    bg: "bg-rose-500",
    border: "border-rose-500/50",
    glow: "bg-rose-500/10",
  },
];

// --- Animations ---
const containerVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 },
  },
};

const listVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 120, damping: 14 },
  },
};

interface PhotonSuggestion {
  type: string;

  properties: {
    osm_id: number;
    name: string;
    city?: string;
    state?: string;
    country?: string;
    street?: string;
    postcode?: string;
  };

  geometry: {
    type: string;

    coordinates: [
      number, // longitude
      number, // latitude
    ];
  };
}

export const BookPage = () => {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(vehicles[0].type);

  const [isDetecting, setIsDetecting] = useState(false);
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<PhotonSuggestion[]>([]);
  const [pickupLat, setPickupLat] = useState("");
  const [pickupLon, setPickupLon] = useState("");
  const [dropLat, setDropLat] = useState("");
  const [dropLon, setDropLon] = useState("");

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!pickupLat || !pickupLon) {
      toast.error("Please wait, getting your location...");
      return;
    }

    const params = new URLSearchParams({
      pickup,
      dropoff,
      vehicle: selectedVehicle,
      number: mobileNumber,
      pickupLat: String(pickupLat),
      pickupLon: String(pickupLon),
      dropLat: String(dropLat),
      dropLon: String(dropLon),
    });

    router.push(`/user/search?${params}`);

  };

  

  const handleDetectLocation = async () => {
    if (!navigator.geolocation) return;

    setIsDetecting(true);
    setPickup("Locating...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // Turant lat/lon save kar do
        setPickupLat(lat.toString());
        setPickupLon(lon.toString());

        try {
          const controller = new AbortController();

          const timeout = setTimeout(() => {
            controller.abort();
          }, 5000);

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
            {
              signal: controller.signal,
              headers: {
                Accept: "application/json",
              },
            },
          );

          clearTimeout(timeout);

          const data = await response.json();

          setPickup(data.display_name || "Address not found");
        } catch (error) {
          console.error(error);

          setPickup(`${lat.toFixed(6)}, ${lon.toFixed(6)}`);
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        console.error(error);
        setPickup("Location access denied");
        setIsDetecting(false);
      },
      {
        enableHighAccuracy: false, // Faster
        timeout: 8000,
        maximumAge: 60000, // Cached location use karega
      },
    );
  };

  const searchAddress = async (location: string) => {
    try {
      if (location.trim().length < 3) {
        setSuggestions([]);
        return;
      }

      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(
          location,
        )}&limit=5`,
      );

      const data = await res.json();

      setSuggestions(data.features || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDropLocation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setDropoff(value);
    searchAddress(value);
  };

  const activeVehicleData = vehicles.find((v) => v.type === selectedVehicle);


  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 sm:p-6 md:p-10 font-sans relative overflow-hidden">
      {/* ── Background Map & Glow Effects ── */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] blur-[150px] pointer-events-none rounded-full transition-colors duration-1000 opacity-20 ${activeVehicleData?.bg}`}
        />
      </div>

      {/* ── Main Booking Card ── */}
      <motion.div
        className="max-w-[1000px] w-full bg-[#0a0f1e]/80 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-[0_20px_80px_rgba(0,0,0,0.6)] overflow-hidden relative z-10 flex flex-col lg:flex-row"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* ── Left Side: Booking Form ── */}
        <div className="lg:w-[45%] bg-white/[0.02] p-6 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 relative">
          <div>
            {/* Added Back Button */}
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-widest uppercase mb-6">
              <Zap className="w-4 h-4" /> Instant Ride
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">
              Where to?
            </h1>
            <p className="text-sm text-slate-400 mb-8 leading-relaxed">
              Enter your destination, choose your ride, and let&apos;s get
              moving.
            </p>

            <form id="booking-form" className="space-y-5 relative">
              <div className="absolute left-[23px] top-[48px] bottom-[110px] w-0.5 bg-white/10 hidden sm:block rounded-full">
                <motion.div
                  className="w-full bg-gradient-to-b from-blue-500 to-emerald-500 rounded-full"
                  initial={{ height: 0 }}
                  animate={{ height: "100%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>

              {/* Pickup Input */}
              <div className="relative z-10 group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <div className="w-3 h-3 rounded-full border-[3px] border-blue-500 bg-transparent shadow-[0_0_10px_rgba(59,130,246,0.5)] group-focus-within:bg-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  required
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  placeholder="Enter pickup location"
                  className="w-full pl-12 pr-12 py-4 bg-black/40 border border-white/10 rounded-2xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-500 hover:bg-black/60"
                />
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  className="absolute inset-y-0 right-2 flex items-center px-3 text-slate-400 hover:text-blue-400 transition-colors"
                  title="Use current location"
                >
                  <LocateFixed
                    className={`w-5 h-5 ${isDetecting ? "animate-spin text-blue-500" : ""}`}
                  />
                </button>
              </div>

              {/* Dropoff Input */}
              <div className="relative z-10 group ">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <div className="w-3 h-3 rounded-none bg-emerald-500" />
                </div>

                <input
                  type="text"
                  required
                  value={dropoff}
                  onChange={handleDropLocation}
                  placeholder="Enter dropoff location"
                  className="w-full pl-12 pr-4 py-4  bg-black/40 border border-white/10 rounded-2xl text-sm font-medium text-white"
                />

                <AnimatePresence>
                  {suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute top-full hide-scrollbar  left-0  bg-black right-0 mt-2 z-999 max-h-50 overflow-y-auto rounded-2xl border border-white/10  shadow-2xl"
                    >
                      {suggestions.map((item, index) => (
                        <div
                          key={`${item.properties.osm_id}-${index}`}
                          className="cursor-pointer px-4 py-3 bg-black z-999 hover:bg-white/10"
                          onClick={() => {
                            setDropoff(
                              [
                                item.properties.name,
                                item.properties.city,
                                item.properties.state,
                              ]
                                .filter(Boolean)
                                .join(", "),
                            );
                            setDropLat(String(item.geometry.coordinates[1]));
                            setDropLon(String(item.geometry.coordinates[0]));

                            setSuggestions([]);
                          }}
                        >
                          <div className="font-medium text-white">
                            {item.properties.name}
                          </div>

                          <div className="text-xs text-slate-400">
                            {[
                              item.properties.street,
                              item.properties.city,
                              item.properties.state,
                              item.properties.country,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {/* Contact Number */}
              <div className="relative  group pt-2">
                <div className="absolute inset-y-0 mt-2 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="w-4 h-4 text-slate-500 group-focus-within:text-white transition-colors" />
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) =>
                    setMobileNumber(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Mobile number"
                  className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-2xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all placeholder:text-slate-500 hover:bg-black/60"
                />
              </div>
            </form>
          </div>

          <div className="mt-8 hidden lg:flex items-center gap-3 text-xs font-semibold text-slate-400 bg-white/5 p-4 rounded-2xl border border-white/5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p>100% Secure &bull; Live Tracking &bull; Verified Drivers</p>
          </div>
        </div>

        {/* ── Right Side: Animated Vehicle List ── */}
        <div className="lg:w-[55%] p-6 sm:p-10 flex flex-col relative ">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white tracking-tight">
              Available Rides
            </h3>
            <span className="text-xs font-bold text-slate-300 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
              {vehicles.length} Options
            </span>
          </div>

          <div className="flex-1 flex flex-col gap-3 max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700 hover:[&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full pr-1 pb-4">
            <AnimatePresence>
              {vehicles.map((v, index) => {
                const Icon = v.icon;
                const isSelected = selectedVehicle === v.type;

                return (
                  <motion.div
                    custom={index}
                    variants={listVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    key={v.id}
                    onClick={() => setSelectedVehicle(v.type)}
                    className={`relative flex items-center p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 overflow-hidden
                      ${
                        isSelected
                          ? `${v.border} ${v.glow} shadow-[0_10px_30px_rgba(0,0,0,0.3)]`
                          : "border-transparent bg-white/[0.03] hover:bg-white/[0.06]"
                      }
                    `}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="activeRide"
                        className="absolute inset-0 bg-white/5 "
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 20,
                        }}
                      />
                    )}

                    <div
                      className={`relative  p-3 sm:p-4 rounded-xl mr-4 flex-shrink-0 transition-all duration-300
                      ${isSelected ? `${v.bg} text-[#020617] shadow-lg` : "bg-black/40 text-slate-400 group-hover:text-white border border-white/5"}
                    `}
                    >
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>

                    <div className="flex-1 min-w-0 relative ">
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          className={`text-base sm:text-lg font-bold truncate transition-colors ${isSelected ? "text-white" : "text-slate-200"}`}
                        >
                          {v.name}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400 truncate">
                        {v.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="pt-6 mt-2 relative z-20 border-t border-white/10">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              form="booking-form"
              type="submit"
              disabled={!pickup || !dropoff || !mobileNumber}
              onClick={handleSearch}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex justify-center items-center gap-3 shadow-[0_10px_40px_rgba(0,0,0,0.4)]
                ${
                  !pickup || !dropoff || !mobileNumber
                    ? "bg-white/10 text-slate-400 cursor-not-allowed"
                    : "bg-white text-black hover:bg-slate-200"
                }
              `}
            >
              <>
                Confirm {activeVehicleData?.name}{" "}
                <ArrowRight className="w-5 h-5" />
              </>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
