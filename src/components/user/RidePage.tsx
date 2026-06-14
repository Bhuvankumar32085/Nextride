"use client";

import { bookingApi } from "@/app/axios/bookingApi";
import { IBooking, IUser } from "@/app/types";
import { socket } from "@/realtime/socket";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Navigation,
  ArrowLeft,
  Sun,
  Moon,
  Phone,
  CircleDollarSign,
  ShieldCheck,
  Compass,
  Zap,
  User,
  XCircle,
  Clock,
  ShieldAlert,
  Star,
} from "lucide-react";

import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useRouter } from "next/navigation";
import { RideChatWidget } from "../RideChatWidget";
import { useAppSelector } from "@/app/redux/hooks";

// --- Custom Leaflet Markers Icons configuration ---
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
        🚖
      </div>
      <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
    </div>
  `,
  className: "",
});

interface PartnerLocation {
  lat: number;
  lng: number;
}

const RidePage = ({ bookingId }: { bookingId: string }) => {
  const { loggedUser } = useAppSelector((store) => store.user);
  const [partner, setPartner] = useState<IUser | null>(null);
  const [booking, setBooking] = useState<IBooking | null>(null);
  const [partnerLocation, setPartnerLocation] =
    useState<PartnerLocation | null>(null);

  // Custom States UI control variables
  const [mounted, setMounted] = useState(false);
  const [mapTheme, setMapTheme] = useState<"dark" | "light">("dark");
  const [routeGeometry, setRouteGeometry] = useState<[number, number][]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const router = useRouter();


  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    socket.on("USER_TRACK_PARTNER_LOCATION", (data) => {
      setPartnerLocation({
        lat: data.latitude,
        lng: data.longitude,
      });
    });

    socket.on("NOTIFY_USER_RIDE_STARTED", (data) => {
      if (data.booking) {
        setBooking(data.booking);
      }
      toast.success("Driver has started the ride 🚖");
    });

    socket.on("NOTIFY_USER_RIDE_COMPLETED", (data) => {
      setBooking(data.booking);
      router.push("/");
      toast.success("Ride completed successfully 🎉");
    });

    socket.on("NOTIFY_USER_FOR_OTP", (data) => {
      setBooking(data.booking);
      toast.success("GET OTP 🎉");
    });

    socket.on("NOTIFY_USER_RIDE_CANCELLED", (data) => {
      if (data.booking) {
        setBooking(data.booking);
      }
      toast.error(`Ride cancelled: ${data.reason}`);
      router.push("/");
    });

    return () => {
      socket.off("USER_TRACK_PARTNER_LOCATION");
      socket.off("NOTIFY_USER_RIDE_STARTED");
      socket.off("NOTIFY_USER_RIDE_CANCELLED");
    };
  }, []);

  useEffect(() => {
    const fetchRideDetails = async () => {
      try {
        const { data } = await bookingApi.get(`/ride-details/${bookingId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (data.success) {
          const partner = data.data.partner;
          const booking = data.data.booking;

          setPartner(partner);
          setBooking(booking);

          if (partner?.location?.coordinates) {
            setPartnerLocation({
              lat: partner.location.coordinates[1],
              lng: partner.location.coordinates[0],
            });
          }
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(error.response?.data);
        }
      }
    };

    fetchRideDetails();
  }, [bookingId]);

  // --- Dynamic OSRM Route Calculation Handler ---
  useEffect(() => {
    if (!booking || !partnerLocation) return;

    const startLon = partnerLocation.lng;
    const startLat = partnerLocation.lat;
    let endLon = booking.dropLocation?.coordinates[0];
    let endLat = booking.dropLocation?.coordinates[1];

    // 💡 LIVE ADAPTIVE WIRING: Modifies mapping bounds based on mongoose active ride status
    if (booking.bookingStatus === "confirmed") {
      // Driver tracking towards pickup spot
      endLon = booking.pickupLocation?.coordinates[0];
      endLat = booking.pickupLocation?.coordinates[1];
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
        console.error("OSRM Tracking trace failure bounds:", err);
      }
    };

    fetchGeometryPath();
  }, [booking, partnerLocation]);

  const handleCancelSubmit = async () => {
    try {
      const { data } = await bookingApi.patch(
        `/cancel-ride-by-user/${bookingId}`,
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
        toast.success("Ride cancelled successfully");
        setBooking(data.data);
        setShowCancelModal(false);
        setCancelReason("");
        router.push("/");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Cancel ride failed");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  // Safe extraction parameters for leaflet markers positioning
  const pLat = booking?.pickupLocation?.coordinates[1] || 29.1469423;
  const pLon = booking?.pickupLocation?.coordinates[0] || 78.2629378;
  const dLat = booking?.dropLocation?.coordinates[1] || 29.4074203;
  const dLon = booking?.dropLocation?.coordinates[0] || 78.4821406;

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
      {/* Route Animation Global CSS Keyframes injector */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .animated-user-line {
          stroke-dasharray: 1200;
          stroke-dashoffset: 1200;
          animation: drawLine 3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @keyframes drawLine {
          to { stroke-dashoffset: 0; }
        }
      `,
        }}
      />

      {/* Map Rendering Container Layer viewport */}
      <div className="absolute inset-0 z-0">
        {mounted && partnerLocation && (
          <MapContainer
            center={[partnerLocation.lat, partnerLocation.lng]}
            zoom={13}
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
            <Marker
              position={[partnerLocation.lat, partnerLocation.lng]}
              icon={driverLiveIcon}
            />

            {routeGeometry.length > 0 && (
              <Polyline
                positions={routeGeometry}
                pathOptions={{
                  color: mapTheme === "dark" ? "#3b82f6" : "#2563eb",
                  weight: 6,
                  opacity: 0.9,
                  className: "animated-user-line",
                }}
              />
            )}
          </MapContainer>
        )}
      </div>

      {/* Floating Header Actions controls overlay row */}
      <div className="absolute left-3 right-3 top-3 lg:left-5 lg:right-5 lg:top-5 z-[1000] flex justify-between items-center pointer-events-none">
        <div
          className={`pointer-events-auto flex items-center gap-2 rounded-2xl border px-4 py-2.5 backdrop-blur-xl transition-all shadow-xl font-bold text-xs ${
            mapTheme === "dark"
              ? "border-white/10 bg-black/50 text-white"
              : "border-slate-300 bg-white/80 text-slate-900"
          }`}
        >
          <Compass
            size={14}
            className="text-blue-500 animate-spin"
            style={{ animationDuration: "6s" }}
          />
          <span>Live Tracking Session Active</span>
        </div>

        <button
          onClick={() =>
            setMapTheme((prev) => (prev === "dark" ? "light" : "dark"))
          }
          className={`pointer-events-auto w-11 h-11 rounded-full border flex items-center justify-center backdrop-blur-xl transition-all shadow-xl ${
            mapTheme === "dark"
              ? "border-white/10 bg-black/50 text-yellow-400 hover:bg-black/70"
              : "border-slate-300 bg-white/80 text-slate-800 hover:bg-white"
          }`}
        >
          {mapTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Ride Overview Details Pullup Sheet Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 18 }}
        className={`absolute bottom-3 left-3 right-3 lg:top-5 lg:bottom-5 lg:left-auto lg:right-5 z-[1000] w-auto lg:w-[420px] max-h-[50vh] sm:max-h-[60vh] lg:max-h-none overflow-y-auto rounded-[32px] border backdrop-blur-3xl shadow-2xl flex flex-col ${
          mapTheme === "dark"
            ? "border-white/10 bg-slate-950/85 text-white"
            : "border-slate-200 bg-white/95 text-slate-900"
        }`}
      >
        {/* Card Header Profile block strip */}
        <div
          className={`p-4 lg:p-6 border-b shrink-0 ${mapTheme === "dark" ? "border-white/5" : "border-slate-200"}`}
        >
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[10px] font-black tracking-widest text-blue-500 uppercase font-mono block">
                Trip Pipeline
              </span>
              <h2 className="text-xl lg:text-2xl font-black tracking-tight mt-0.5">
                {booking?.bookingStatus === "confirmed"
                  ? "Driver is arriving"
                  : "You are in Transit"}
              </h2>
            </div>
            <div
              className={`px-2.5 py-1 rounded-full text-[10px] font-black font-mono uppercase tracking-wide flex items-center gap-1 border ${
                booking?.bookingStatus === "confirmed"
                  ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full animate-pulse ${booking?.bookingStatus === "confirmed" ? "bg-blue-400" : "bg-emerald-400"}`}
              />
              {booking?.bookingStatus || "Syncing"}
            </div>
          </div>
        </div>

        {/* Dynamic Financial summaries blocks logs row */}
        <div className="grid grid-cols-2 gap-3 px-4 lg:px-6 py-4 shrink-0 text-center sm:text-left">
          <div
            className={`p-3 rounded-2xl border ${mapTheme === "dark" ? "bg-white/[0.01] border-white/5" : "bg-slate-100/50 border-slate-200"}`}
          >
            <span className="text-[9px] text-slate-500 font-bold block font-mono uppercase tracking-wider flex items-center gap-1 justify-center sm:justify-start">
              <CircleDollarSign size={12} className="text-emerald-500" /> Total
              Fare Invoice
            </span>
            <p className="font-mono font-black text-lg lg:text-xl mt-0.5 text-gradient bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              ₹{booking?.totalFare || booking?.fare || 0}
            </p>
          </div>

          <div
            className={`p-3 rounded-2xl border ${mapTheme === "dark" ? "bg-white/[0.01] border-white/5" : "bg-slate-100/50 border-slate-200"}`}
          >
            <span className="text-[9px] text-slate-500 font-bold block font-mono uppercase tracking-wider flex items-center gap-1 justify-center sm:justify-start">
              <Zap size={12} className="text-yellow-500" /> Settlement Mode
            </span>
            <p
              className={`font-black text-sm uppercase mt-1 tracking-wide ${booking?.paymentMethod === "cod" ? "text-orange-400" : "text-cyan-400"}`}
            >
              {booking?.paymentMethod === "cod"
                ? "Cash (COD)"
                : "Online Wallet"}
            </p>
          </div>
        </div>

        {/* Fleet Assigned Driver Data panel profile details block */}
        <div className="px-4 lg:px-6 py-1 shrink-0">
          <div
            className={`rounded-2xl border p-4 ${mapTheme === "dark" ? "bg-white/[0.01] border-white/5" : "bg-slate-50"}`}
          >
            <div className="flex items-center gap-3.5">
              <div className="relative shrink-0">
                <img
                  src={partner?.image || "https://i.pravatar.cc/150?img=12"}
                  alt={partner?.name || "Driver"}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white/10"
                />
                <div className="absolute -bottom-1 -right-1 bg-green-500 text-[8px] font-black text-white px-1 py-0.5 rounded-full border border-slate-950 flex items-center gap-0.5">
                  4.9 <Star size={6} fill="currentColor" />
                </div>
              </div>

              <div className="flex-1">
                <span className="text-[9px] font-black text-slate-500 tracking-wider font-mono block">
                  Your Assigned Driver
                </span>
                <h4 className="text-sm font-bold text-slate-200 leading-tight capitalize mt-0.5">
                  {partner?.name || "Bhuvan Kumar"}
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5 tracking-widest font-bold uppercase font-mono">
                  NEXT RIDE PARTNER NODE
                </p>
              </div>

              <a
                href={`tel:${booking?.driverMobileNumber}`}
                className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-all shadow-md"
              >
                <Phone size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* Trip Paths Displays details text matrix component lists */}
        <div className="px-4 lg:px-6 py-4 shrink-0">
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
                  Pickup Perimeter Address
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
                  Drop Bounds Area
                </span>
                <p className="text-xs font-semibold mt-0.5 text-slate-300 leading-normal line-clamp-1">
                  {booking?.dropAddress}
                </p>
              </div>
            </div>
          </div>
        </div>
        {booking?.bookingStatus === "started" && booking?.dropOtp && (
          <div className="px-4 lg:px-6 pb-3">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    🔐
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-black">
                      Ride Completion OTP
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      Share with driver after reaching destination
                    </p>
                  </div>
                </div>

                <div className="px-4 py-2 rounded-xl bg-black/20 border border-white/10">
                  <span className="text-2xl font-black font-mono tracking-[0.25em] text-white">
                    {booking.dropOtp}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 💡 CONDITIONAL ACTION BUTTON INJECTION: Only renders on 'confirmed' state blocks */}
        {booking?.bookingStatus === "confirmed" && (
          <div className="p-4 lg:p-6 pt-0 mt-auto shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCancelModal(true)}
              className="w-full h-12 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-colors text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
            >
              <XCircle size={16} /> Cancel Ride Session
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* ── USER CANCELLATION OVERLAY PORTAL SCREEN MODAL (Root Level Anchored) ── */}
      <AnimatePresence>
        {showCancelModal && (
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
              className="w-full max-w-lg rounded-3xl border border-red-500/20 bg-slate-950 p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center gap-2 text-red-400">
                <ShieldAlert size={22} />
                <h2 className="text-xl font-black uppercase tracking-tight">
                  Cancel Request Notice
                </h2>
              </div>

              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-slate-300 leading-relaxed space-y-2">
                <p className="font-bold text-sm text-slate-200">
                  Cancellation Guidelines & Terms:
                </p>
                <p>
                  • Free cancellation parameter window closes once driver
                  tracking perimeter merges.
                </p>
                <p>
                  • Frequent cancellations block core algorithmic request
                  priority parameters.
                </p>
                <p>
                  • Please provide an honest reason to help optimize fleet
                  operations metrics.
                </p>
              </div>

              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please state your cancellation parameter reason..."
                className="w-full h-24 rounded-2xl border border-white/10 bg-slate-900 p-4 text-white text-xs resize-none outline-none focus:border-red-500 transition-colors placeholder:text-slate-600"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 h-12 rounded-2xl border border-white/10 text-white text-xs font-bold hover:bg-white/5 transition-all"
                >
                  Keep Booking
                </button>
                <button
                  disabled={!cancelReason.trim()}
                  onClick={handleCancelSubmit}
                  className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 text-white font-black text-xs uppercase tracking-wider disabled:opacity-40 transition-all shadow-lg"
                >
                  Confirm Cancel
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

export default RidePage;
