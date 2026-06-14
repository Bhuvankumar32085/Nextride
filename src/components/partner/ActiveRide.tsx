"use client";

import { bookingApi } from "@/app/axios/bookingApi";
import { useAppSelector } from "@/app/redux/hooks";
import { IBooking } from "@/app/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MapPin,
  Navigation,
  ArrowLeft,
  Sun,
  Moon,
  Phone,
  CircleDollarSign,
  Coins,
  ShieldCheck,
  Compass,
  Zap,
  User,
  XCircle,
  PlayCircle,
  KeyRound,
  CheckCircle2,
} from "lucide-react";

import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { socket } from "@/realtime/socket";
import toast from "react-hot-toast";
import { RideChatWidget } from "../RideChatWidget";

// --- Custom Leaflet Markers Style Sheets Matrix ---
const pickupIcon = L.divIcon({
  html: `
    <div class="relative">
      <div class="absolute w-8 h-8 bg-green-500 rounded-full animate-ping opacity-40 -left-1.5 -top-1.5"></div>
      <div class="relative w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
    </div>
  `,
  className: "",
});

const dropIcon = L.divIcon({
  html: `
    <div class="relative">
      <div class="absolute w-8 h-8 bg-red-500 rounded-full animate-ping opacity-40 -left-1.5 -top-1.5"></div>
      <div class="relative w-5 h-5 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
    </div>
  `,
  className: "",
});

const driverLiveIcon = L.divIcon({
  html: `
    <div class="relative transform transition-transform duration-1000">
      <div class="w-9 h-9 bg-slate-900 border-2 border-blue-500 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 text-xl">
        🚘
      </div>
      <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
    </div>
  `,
  className: "",
});

const Page = () => {
  const { loggedUser } = useAppSelector((store) => store.user);
  const [booking, setBooking] = useState<IBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [mapTheme, setMapTheme] = useState<"dark" | "light">("dark");
  const [routeGeometry, setRouteGeometry] = useState<[number, number][]>([]);
  const [partnerLocation, setPartnerLocation] = useState<{
    lat?: number;
    lng?: number;
  }>({
    lat: loggedUser?.location?.coordinates[1],
    lng: loggedUser?.location?.coordinates[0],
  });
  
  const [showStartRideModal, setShowStartRideModal] = useState(false);
  const [showCancelRideModal, setShowCancelRideModal] = useState(false);
  const [showCompleteRideModal, setShowCompleteRideModal] = useState(false);
  
  const [cancelReason, setCancelReason] = useState("");
  const [dropOtp, setDropOtp] = useState("");
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await bookingApi.get("/partner/active-ride", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (data.success) {
        setBooking(data.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(error.response?.data);
      }
    } finally {
      setLoading(false);
    }
  };

  // Safe Extraction of baseline points for fallback values
  const pLat = booking?.pickupLocation?.coordinates[1] || 29.1469423;
  const pLon = booking?.pickupLocation?.coordinates[0] || 78.2629378;
  const dLat = booking?.dropLocation?.coordinates[1] || 29.4074203;
  const dLon = booking?.dropLocation?.coordinates[0] || 78.4821406;

  const partnerLat =
    partnerLocation.lat || loggedUser?.location?.coordinates[1] || pLat + 0.002;

  const partnerLon =
    partnerLocation.lng || loggedUser?.location?.coordinates[0] || pLon + 0.002;

  // --- Dynamic OSRM Route Mesh Fetch Effect with Dynamic Switching ---
  useEffect(() => {
    if (!booking) return;

    const startLon = partnerLon;
    const startLat = partnerLat;
    let endLon = dLon;
    let endLat = dLat;

    if (booking.bookingStatus === "confirmed") {
      endLon = booking.pickupLocation?.coordinates[0] || pLon;
      endLat = booking.pickupLocation?.coordinates[1] || pLat;
    } else {
      endLon = booking.dropLocation?.coordinates[0] || dLon;
      endLat = booking.dropLocation?.coordinates[1] || dLat;
    }

    if (!startLon || !startLat || !endLon || !endLat) return;

    const fetchGeometryPath = async () => {
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`,
        );
        const routeData = await res.json();
        if (routeData.routes && routeData.routes[0]) {
          const coords = routeData.routes[0].geometry.coordinates.map(
            (c: [number, number]) => [c[1], c[0]],
          );
          setRouteGeometry(coords);
        }
      } catch (err) {
        console.error("OSRM Route trace failed:", err);
      }
    };

    fetchGeometryPath();
  }, [booking, partnerLat, partnerLon, pLat, pLon, dLat, dLon]);

  useEffect(() => {
    if (!booking?._id) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setPartnerLocation({
          lat,
          lng,
        });

        socket.emit("PARTNER_LOCATION_UPDATE", {
          userId: booking.userId,
          bookingId: booking._id,
          driverId: booking.driverId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (err) => console.log(err),
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [booking]);

  const handleStartRide = async () => {
    setShowStartRideModal(false);
    try {
      const { data } = await bookingApi.patch(
        `/start-ride/${booking?._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (data.success) {
        toast.success("Ride Started Successfully 🚖");
        setBooking(data.data);
        setShowStartRideModal(false);
      }
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Start ride failed");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const handleCancelRide = async () => {
    setShowCancelRideModal(false);
    try {
      const { data } = await bookingApi.patch(
        `/cancel-ride/${booking?._id}`,
        {
          reason: cancelReason,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (data.success) {
        toast.success("Ride Cancelled Successfully");
        setBooking(data.data);
        setShowCancelRideModal(false);
        setCancelReason("");
        router.push("/");
      }
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Cancel ride failed");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const handleGenerateOtp = async () => {
    if (!booking?._id) return;
    try {
      const { data } = await bookingApi.post(
        `/generate-drop-otp/${booking._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      toast.success("Drop OTP generated");
    } catch (error) {
      console.log(error);
    }
  };

  const handleVerifyDropOtp = async () => {
    if (!booking?._id) return;
    if (!dropOtp || dropOtp.length < 4) {
      toast.error("Please enter a valid OTP");
      return;
    }
    
    try {
      const { data } = await bookingApi.post(
        `/verify-drop-otp/${booking._id}`,
        {
          otp: dropOtp,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (data.success) {
        toast.success("Ride Completed 🎉");
        setBooking(data.data);
        setShowCompleteRideModal(false);
        router.push("/");
      }
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Invalid OTP or Error");
      }
    }
  };

  useEffect(() => {
    socket.on("NOTIFY_PARTNER_RIDE_CANCELLED_BY_USER", (data) => {
      toast.error(`User cancelled ride: ${data.reason}`);
      setBooking(data.booking);
      router.push("/");
    });

    return () => {
      socket.off("NOTIFY_PARTNER_RIDE_CANCELLED_BY_USER");
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#020617] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-mono tracking-wider animate-pulse">
          Initializing Tracking Module...
        </p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen w-full bg-[#020617] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-mono tracking-wider animate-pulse">
          Active Booking Not Found...
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative h-screen w-full overflow-hidden ${mapTheme === "dark" ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-900"}`}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .animated-transit-line {
          stroke-dasharray: 1200;
          stroke-dashoffset: 1200;
          animation: drawPath 3.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @keyframes drawPath {
          to { stroke-dashoffset: 0; }
        }
      `,
        }}
      />

      {/* Map Content Viewport block */}
      <div className="absolute inset-0 z-0">
        {mounted && (
          <MapContainer
            center={[partnerLat, partnerLon]}
            zoom={12}
            className="h-full w-full"
            zoomControl={false}
          >
            <TileLayer
              url={
                mapTheme === "dark"
                  ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              }
            />
            <Marker position={[pLat, pLon]} icon={pickupIcon} />
            <Marker position={[dLat, dLon]} icon={dropIcon} />
            <Marker position={[partnerLat, partnerLon]} icon={driverLiveIcon} />

            {routeGeometry.length > 0 && (
              <Polyline
                positions={routeGeometry}
                pathOptions={{
                  color: mapTheme === "dark" ? "#3b82f6" : "#2563eb",
                  weight: 6,
                  opacity: 0.85,
                  className: "animated-transit-line",
                }}
              />
            )}
          </MapContainer>
        )}
      </div>

      {/* Floating Control Systems Header Bar */}
      <div className="absolute left-3 right-3 top-3 lg:left-5 lg:right-5 lg:top-5 z-[1000] flex justify-between items-center pointer-events-none">
        <button
          onClick={() => router.back()}
          className={`pointer-events-auto flex items-center gap-2 rounded-2xl border px-4 py-2.5 lg:px-5 lg:py-3 backdrop-blur-xl transition-all shadow-xl ${
            mapTheme === "dark"
              ? "border-white/10 bg-black/50 text-white hover:bg-black/70"
              : "border-slate-300 bg-white/80 text-slate-900 hover:bg-white"
          }`}
        >
          <ArrowLeft size={16} />
          <span className="text-xs sm:text-sm font-bold">Console Back</span>
        </button>

        <button
          onClick={() =>
            setMapTheme((prev) => (prev === "dark" ? "light" : "dark"))
          }
          className={`pointer-events-auto w-11 h-11 lg:w-12 lg:h-12 rounded-full border flex items-center justify-center backdrop-blur-xl transition-all shadow-xl ${
            mapTheme === "dark"
              ? "border-white/10 bg-black/50 text-yellow-400 hover:bg-black/70"
              : "border-slate-300 bg-white/80 text-slate-800 hover:bg-white"
          }`}
        >
          {mapTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Overlapping Informational Tracking Dashboard Sheet Panel */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 18 }}
        className={`absolute bottom-3 left-3 right-3 lg:top-5 lg:bottom-5 lg:left-auto lg:right-5 z-[1000] w-auto lg:w-[420px] max-h-[55vh] sm:max-h-[65vh] lg:max-h-none overflow-y-auto rounded-[32px] border backdrop-blur-3xl shadow-2xl flex flex-col ${
          mapTheme === "dark"
            ? "border-white/10 bg-slate-950/80 text-white"
            : "border-slate-200 bg-white/90 text-slate-900"
        }`}
      >
        {/* Console Navigation Meta details header */}
        <div
          className={`p-4 lg:p-6 border-b shrink-0 ${mapTheme === "dark" ? "border-white/5" : "border-slate-200"}`}
        >
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[10px] font-black tracking-widest text-blue-500 uppercase font-mono block">
                Navigation Unit
              </span>
              <h2 className="text-xl lg:text-2xl font-black tracking-tight mt-0.5">
                Active Transit Route
              </h2>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black font-mono uppercase tracking-wide flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />{" "}
              {booking?.bookingStatus || "Confirmed"}
            </div>
          </div>
        </div>

        {/* Core Pricing Metadata parameters grid logs row */}
        <div className="grid grid-cols-2 gap-3 px-4 lg:px-6 py-4 shrink-0 text-center sm:text-left">
          <div
            className={`p-3 rounded-2xl border ${mapTheme === "dark" ? "bg-white/[0.01] border-white/5" : "bg-slate-100/50 border-slate-200"}`}
          >
            <span className="text-[9px] text-slate-500 font-bold block font-mono uppercase tracking-wider flex items-center gap-1 justify-center sm:justify-start">
              <CircleDollarSign size={12} className="text-blue-500" /> Total
              Collected
            </span>
            <p className="font-mono font-black text-lg lg:text-xl mt-0.5 text-gradient bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              ₹{booking?.totalFare || booking?.fare || 0}
            </p>
          </div>

          <div
            className={`p-3 rounded-2xl border ${mapTheme === "dark" ? "bg-white/[0.01] border-white/5" : "bg-slate-100/50 border-slate-200"}`}
          >
            <span className="text-[9px] text-slate-500 font-bold block font-mono uppercase tracking-wider flex items-center gap-1 justify-center sm:justify-start">
              <Zap size={12} className="text-yellow-500" /> Ledger Mode
            </span>
            <p
              className={`font-black text-sm uppercase mt-1 tracking-wide ${booking?.paymentMethod === "cod" ? "text-orange-400" : "text-cyan-400"}`}
            >
              {booking?.paymentMethod === "cod" ? "Cash (COD)" : "Digital Paid"}
            </p>
          </div>
        </div>

        {/* Dynamic Cash Flow Management alert boxes section wrapper */}
        <div className="px-4 lg:px-6 pb-2 shrink-0">
          {booking?.paymentMethod === "cod" ? (
            <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10 shadow-md">
              <div className="flex items-start gap-3">
                <Coins
                  className="text-orange-400 shrink-0 mt-0.5 animate-pulse"
                  size={18}
                />
                <div>
                  <h4 className="text-xs font-black text-orange-400 uppercase tracking-wider">
                    Physical Cash Required
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    This is an off-network settlement loop. Collect exactly{" "}
                    <b className="text-white font-mono text-xs px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                      ₹{booking?.totalFare}
                    </b>{" "}
                    inside physical terminal parameters directly from client
                    resources.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 shadow-md">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  className="text-cyan-400 shrink-0 mt-0.5"
                  size={18}
                />
                <div>
                  <h4 className="text-xs font-black text-cyan-400 uppercase tracking-wider">
                    Escrow Wallet Balanced
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Payment transaction settled online under ID checks. Net
                    balance reflects safely inside profile registry node
                    parameters.{" "}
                    <span className="text-cyan-400 font-bold">
                      Do not charge any raw bills.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Path Text Matrix Display Rows container block */}
        <div className="px-4 lg:px-6 py-3 shrink-0">
          <div
            className={`rounded-2xl border p-4 ${mapTheme === "dark" ? "bg-white/[0.01] border-white/5" : "bg-white border-slate-200"}`}
          >
            <div className="flex items-start gap-3 relative">
              <div className="absolute left-[11px] top-[24px] bottom-[-20px] w-[2px] border-l-2 border-dashed border-slate-700" />
              <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-mono text-xs shrink-0 mt-0.5">
                A
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  Client Terminal Pickup
                </span>
                <p className="text-xs font-semibold mt-0.5 text-slate-300 leading-normal line-clamp-2">
                  {booking?.pickupAddress}
                </p>
              </div>
            </div>

            <div className="h-6" />

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-mono text-xs shrink-0 mt-0.5">
                B
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  Drop Bound Zone
                </span>
                <p className="text-xs font-semibold mt-0.5 text-slate-300 leading-normal line-clamp-1">
                  {booking?.dropAddress}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Client Profile and Dial Node contacts bar footer strip layout */}
        <div className="p-4 lg:p-6 pt-0 mt-auto shrink-0">
          <div
            className={`rounded-2xl border p-3.5 flex items-center justify-between ${
              mapTheme === "dark"
                ? "bg-white/[0.01] border-white/5"
                : "bg-white border-slate-200 shadow-sm"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white text-sm shadow-md">
                <User size={18} />
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block font-mono">
                  Passenger Node
                </span>
                <h4 className="text-sm font-bold text-slate-200 mt-0.5">
                  Rider Client ID
                </h4>
              </div>
            </div>

            <a
              href={`tel:${booking?.userMobileNumber}`}
              className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-all shadow-md group flex items-center gap-1.5 font-mono text-xs font-bold"
            >
              <Phone size={14} className="group-hover:animate-bounce" /> Call
              Rider
            </a>
          </div>

          {/* Action Control Buttons Trigger Bar */}
          {booking?.bookingStatus === "confirmed" && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowStartRideModal(true)}
                className="h-11 w-full text-xs rounded-xl bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 text-white font-black uppercase tracking-wider shadow-lg shadow-green-500/10 flex items-center justify-center gap-2"
              >
                <PlayCircle size={16} />
                Start Ride
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCancelRideModal(true)}
                className="h-11 w-full text-xs rounded-xl bg-gradient-to-r from-red-600 via-rose-500 to-red-500 text-white font-black uppercase tracking-wider shadow-lg shadow-red-500/10 flex items-center justify-center gap-2"
              >
                <XCircle size={16} />
                Cancel Ride
              </motion.button>
            </div>
          )}
          {booking?.bookingStatus === "started" && (
            <div className="grid grid-cols-1 gap-3 mt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  handleGenerateOtp();
                  setShowCompleteRideModal(true);
                }}
                className="h-11 w-full text-xs rounded-xl bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 text-white font-black uppercase tracking-wider shadow-lg shadow-green-500/10 flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={16} />
                Completed Ride
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── MODALS ARCHITECTURE ANCHORS AREA ── */}
      <AnimatePresence>
        
        {/* Cancel Trip Warning Portal Block */}
        {showCancelRideModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-lg rounded-3xl border border-red-500/20 bg-slate-950 p-6 shadow-2xl"
            >
              <h2 className="text-xl font-black text-red-400 flex items-center gap-2">
                ⚠ Cancel Ride Warning
              </h2>

              <div className="mt-4">
                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-slate-300 leading-relaxed">
                  <p className="font-bold">
                    According to NextRide Partner Policy:
                  </p>
                  <div className="mt-3 space-y-2 text-xs text-slate-400">
                    <p>• You may receive only the travelled fare amount.</p>
                    <p>• Remaining trip earnings may be lost.</p>
                    <p>• Frequent cancellations reduce your partner rating.</p>
                    <p>
                      • Excessive cancellations may result in account suspension
                      or permanent blocking.
                    </p>
                    <p>• Please provide a genuine and valid reason.</p>
                  </div>
                </div>

                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter cancellation reason..."
                  className="w-full mt-4 h-28 rounded-2xl border border-white/10 bg-slate-900 p-4 text-white text-sm resize-none outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCancelRideModal(false)}
                  className="flex-1 h-12 rounded-2xl border border-white/10 text-white text-xs font-bold hover:bg-white/5 transition-colors"
                >
                  Keep Ride
                </button>
                <button
                  disabled={!cancelReason.trim()}
                  onClick={handleCancelRide}
                  className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 text-white font-bold text-xs uppercase tracking-wider disabled:opacity-50 transition-opacity"
                >
                  Cancel Ride
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Start Trip Confirmation Portal Block */}
        {showStartRideModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-lg rounded-3xl border border-emerald-500/20 bg-slate-950 p-6 shadow-2xl"
            >
              <h2 className="text-xl font-black text-emerald-400">
                🚖 Start Ride Confirmation
              </h2>

              <div className="mt-4 text-sm text-slate-300 space-y-3 leading-relaxed">
                <p>
                  By clicking <b>Start Ride</b>, you confirm that:
                </p>
                <ul className="space-y-2 text-xs text-slate-400">
                  <li>✅ You have reached the passenger terminal.</li>
                  <li>✅ Passenger has been onboarded safely.</li>
                  <li>✅ Ride track is officially commencing.</li>
                  <li>
                    ✅ You are now travelling towards the drop location
                    parameters.
                  </li>
                </ul>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400/90 font-medium leading-relaxed">
                  Please continue only if the passenger is physically present in
                  your vehicle cabin space.
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowStartRideModal(false)}
                  className="flex-1 h-12 rounded-2xl border border-white/10 text-white text-xs font-bold hover:bg-white/5 transition-colors"
                >
                  Not Yet
                </button>
                <button
                  onClick={handleStartRide}
                  className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 text-white font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Yes, Start Ride
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── COMPLETION OTP VERIFICATION MODAL ── */}
        {showCompleteRideModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-sm rounded-3xl border border-emerald-500/20 bg-slate-950 p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 text-emerald-400">
                <KeyRound size={24} />
                <h2 className="text-xl font-black uppercase tracking-tight">
                  Verify Drop OTP
                </h2>
              </div>
              
              <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                An OTP has been securely sent to the passenger&apos;s registered mobile number. Please ask the passenger and enter it below to officially complete the ride loop and process pending settlements.
              </p>

              <input
                type="text"
                maxLength={6}
                value={dropOtp}
                onChange={(e) => setDropOtp(e.target.value)}
                placeholder="Enter OTP"
                className="w-full mt-5 bg-white/[0.03] focus:bg-white/[0.05] border border-white/10 rounded-2xl p-4 text-center text-xl tracking-[0.4em] text-white outline-none focus:border-emerald-500/50 transition-all duration-300 font-bold"
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCompleteRideModal(false)}
                  className="flex-1 h-12 rounded-2xl border border-white/10 text-white text-xs font-bold hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={dropOtp.length < 4}
                  onClick={handleVerifyDropOtp}
                  className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-xs uppercase tracking-wider disabled:opacity-50 transition-opacity"
                >
                  Verify & Complete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <RideChatWidget
        bookingId={booking._id}
        receiverName={loggedUser?.name}
        booking={booking}
      />
    </div>
  );
};

export default Page;