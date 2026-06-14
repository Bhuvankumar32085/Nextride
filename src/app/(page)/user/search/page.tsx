"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MapPin,
  Navigation,
  ArrowLeft,
  Star,
  Car,
  Sun,
  Moon,
  ShieldCheck,
} from "lucide-react";

import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import toast from "react-hot-toast";
import { authApi } from "@/app/axios/authApi";
import { IUser, IVehicle } from "@/app/types";
import Image from "next/image";
import DeriverDetail from "@/components/user/DeriverDetail";

// --- Custom Icons ---
const pickupIcon = L.divIcon({
  html: `
    <div class="relative">
      <div class="absolute w-8 h-8 bg-green-500 rounded-full animate-ping opacity-40"></div>
      <div class="relative w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
    </div>
  `,
  className: "",
});

const dropIcon = L.divIcon({
  html: `
    <div class="relative">
      <div class="absolute w-8 h-8 bg-red-500 rounded-full animate-ping opacity-40"></div>
      <div class="relative w-5 h-5 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
    </div>
  `,
  className: "",
});

export interface INearbyPartner extends IUser {
  distance: number;
  vehicle: IVehicle;
}

export default function RouteOverviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const mounted = typeof window !== "undefined";
  const [route, setRoute] = useState<[number, number][]>([]);
  const [distance, setDistance] = useState("Calculating...");
  const [eta, setEta] = useState("..."); //Estimated Time of Arrival
  const [fare, setFare] = useState("..."); //Ride ka total kiraya / price
  const [nearbyPartners, setNearbyPartners] = useState<INearbyPartner[]>([]);
  // New States
  const [mapTheme, setMapTheme] = useState<"dark" | "light">("dark");

  const pickup = searchParams.get("pickup") || "Cyber Hub, Gurugram";
  const dropoff = searchParams.get("dropoff") || "IGI Airport, Terminal 3";

  // Dummy defaults if params are missing
  const pLat = Number(searchParams.get("pickupLat"));
  const pLon = Number(searchParams.get("pickupLon"));
  const dLat = Number(searchParams.get("dropLat"));
  const dLon = Number(searchParams.get("dropLon"));
  const vehicleType = searchParams.get("vehicle");

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${pLon},${pLat};${dLon},${dLat}?overview=full&geometries=geojson`,
        );
        const data = await res.json();
        const coords = data.routes[0].geometry.coordinates.map(
          (c: [number, number]) => [c[1], c[0]],
        );
        const km = data.routes[0].distance / 1000;
        const durationSeconds = data.routes[0].duration;
        const minutes = Math.round(durationSeconds / 60);

        setDistance(`${km.toFixed(1)} KM`);
        setRoute(coords);
        setEta(`${minutes} Min`);
        setFare(`₹${Math.round(km * 18)}`);
      } catch (err) {
        console.log(err);
      }
    };

    fetchRoute();
  }, [pLat, pLon, dLat, dLon]);

  useEffect(() => {
    const getPartnerWithIn5_Km = async () => {
      try {
        const { data } = await authApi.post(
          "get-partnet-with-in-5km",
          { pickupLat: pLat, pickupLon: pLon, vehicleType },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        if (data.success) {
          setNearbyPartners(data.data);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.message || "Failed to fetch data.");
        } else {
          toast.error("An unexpected error occurred.");
        }
      }
    };

    getPartnerWithIn5_Km();
  }, []);


  return (
    <div
      className={`relative h-screen w-full overflow-hidden ${mapTheme === "dark" ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-900"}`}
    >
      {/* Route Animation Global CSS */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .animated-route {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: drawLine 3s ease-in-out forwards;
        }
        @keyframes drawLine {
          to { stroke-dashoffset: 0; }
        }
      `,
        }}
      />

      {/* Glow Effects (Only in Dark Mode) */}
      {mapTheme === "dark" && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[150px]" />
          <div className="absolute right-0 bottom-0 h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[150px]" />
        </div>
      )}

      {/* Map */}
      <div className="absolute inset-0 z-0">
        {mounted && (
          <MapContainer
            center={[pLat, pLon]}
            zoom={13}
            className="h-full w-full"
            // zoomControl={false}
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

            {/* Animated Route Polyline */}
            {route.length > 0 && (
              <Polyline
                positions={route}
                pathOptions={{
                  color: mapTheme === "dark" ? "#3b82f6" : "#2563eb",
                  weight: 6,
                  opacity: 0.9,
                  className: "animated-route",
                }}
              />
            )}
          </MapContainer>
        )}
      </div>

      {/* ADDED: lg:right-[460px] taaki desktop par theme button dashboard ke peeche hide na ho */}
      <div className="absolute left-3 right-3 top-3 lg:left-5 lg:right-[460px] lg:top-5 z-[1000] flex justify-between pointer-events-none">
        <button
          onClick={() => router.back()}
          className={`pointer-events-auto flex items-center gap-2 rounded-2xl border px-4 py-2.5 lg:px-5 lg:py-3 backdrop-blur-xl transition-all ${
            mapTheme === "dark"
              ? "border-white/10 bg-black/40 text-white hover:bg-black/60"
              : "border-slate-300 bg-white/70 text-slate-900 hover:bg-white/90 shadow-sm"
          }`}
        >
          <ArrowLeft size={18} />
          <span className="text-sm lg:text-base">Back</span>
        </button>

        <button
          onClick={() =>
            setMapTheme((prev) => (prev === "dark" ? "light" : "dark"))
          }
          className={`pointer-events-auto flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-full border backdrop-blur-xl transition-all ${
            mapTheme === "dark"
              ? "border-white/10 bg-black/40 text-yellow-400 hover:bg-black/60"
              : "border-slate-300 bg-white/70 text-slate-800 hover:bg-white/90 shadow-sm"
          }`}
        >
          {mapTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Dashboard Side/Bottom Panel */}
      <motion.div
        // Changed animation to y: 50 for smooth slide-up which works well on mobile & desktop
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`absolute bottom-2 left-2 right-2 hide-scrollbar sm:bottom-4 sm:left-4 sm:right-4 lg:top-5 lg:bottom-5 lg:left-auto lg:right-5 z-[1000] w-auto lg:w-[430px] max-h-[60vh] sm:max-h-[70vh] lg:max-h-none overflow-auto rounded-3xl border backdrop-blur-3xl shadow-2xl flex flex-col ${
          mapTheme === "dark"
            ? "border-white/10 bg-black/70 text-white"
            : "border-slate-200 bg-white/80 text-slate-900"
        }`}
      >
        {/* Header with Weather */}
        <div
          className={`p-4 lg:p-6 border-b shrink-0 ${mapTheme === "dark" ? "border-white/10" : "border-slate-200"}`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h1 className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-2xl lg:text-3xl font-black text-transparent">
                Overview
              </h1>
              <p
                className={`mt-1 text-xs lg:text-sm ${mapTheme === "dark" ? "text-slate-400" : "text-slate-500"}`}
              >
                Live navigation & conditions
              </p>
            </div>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-2 p-3 lg:p-0  lg:px-5 py-2 mt-2 shrink-0">
          <div
            className={`rounded-2xl p-3 lg:p-4 ${mapTheme === "dark" ? "bg-white/5" : "bg-slate-100"}`}
          >
            <Car className="mb-1 lg:mb-2 text-blue-500 w-4 h-4 lg:w-5 lg:h-5" />
            <p
              className={`text-[10px] lg:text-xs ${mapTheme === "dark" ? "text-slate-400" : "text-slate-500"}`}
            >
              Distance
            </p>
            <p className="font-bold text-xs lg:text-base">{distance}</p>
          </div>
          <div
            className={`rounded-2xl p-3 lg:p-4 ${mapTheme === "dark" ? "bg-white/5" : "bg-slate-100"}`}
          >
            <Car className="mb-1 lg:mb-2 text-blue-500 w-4 h-4 lg:w-5 lg:h-5" />
            <p
              className={`text-[10px] lg:text-xs ${mapTheme === "dark" ? "text-slate-400" : "text-slate-500"}`}
            >
              ETA
            </p>
            <p className="font-bold text-xs lg:text-base">{eta}</p>
          </div>
        </div>

        {/* Route Path Display */}
        <div className="px-3 lg:px-5 py-2 lg:py-3 shrink-0">
          <div
            className={`rounded-3xl border p-4 lg:p-5 ${mapTheme === "dark" ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"}`}
          >
            <div className="mb-3 lg:mb-5 flex items-start gap-3 lg:gap-4">
              <div className="rounded-full bg-green-500/20 p-2 mt-1">
                <MapPin className="text-green-500 w-3 h-3 lg:w-4 lg:h-4" />
              </div>
              <div>
                <p
                  className={`text-[9px] lg:text-[10px] font-bold tracking-wider ${mapTheme === "dark" ? "text-slate-400" : "text-slate-500"}`}
                >
                  PICKUP
                </p>
                <p className="font-semibold text-xs lg:text-sm mt-0.5 lg:mt-1">
                  {pickup}
                </p>
              </div>
            </div>

            <div className="mb-3 lg:mb-5 ml-[15px] lg:ml-[19px] h-6 lg:h-8 w-[2px] bg-gradient-to-b from-green-500 to-red-500 rounded-full" />

            <div className="flex items-start gap-3 lg:gap-4">
              <div className="rounded-full bg-red-500/20 p-2 mt-1">
                <Navigation className="text-red-500 w-3 h-3 lg:w-4 lg:h-4" />
              </div>
              <div>
                <p
                  className={`text-[9px] lg:text-[10px] font-bold tracking-wider ${mapTheme === "dark" ? "text-slate-400" : "text-slate-500"}`}
                >
                  DESTINATION
                </p>
                <p className="font-semibold text-xs lg:text-sm mt-0.5 lg:mt-1">
                  {dropoff}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Driver Details */}
        <DeriverDetail
          nearbyPartners={nearbyPartners}
          mapTheme={mapTheme}
          distance={distance}
          pickup={pickup}
          dropoff={dropoff}
          pLat={pLat}
          pLon={pLon}
          dLat={dLat}
          dLon={dLon}
          vehicleType={vehicleType}
        />
      </motion.div>
    </div>
  );
}
