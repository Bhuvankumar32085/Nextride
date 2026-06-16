"use client";

import { INearbyPartner } from "@/app/(page)/user/search/page";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const DeriverDetail = ({
  nearbyPartners,
  mapTheme,
  distance,
  pickup,
  dropoff,
  pLat,
  pLon,
  dLat,
  dLon,
  vehicleType,
}: {
  nearbyPartners: INearbyPartner[];
  mapTheme: "dark" | "light";
  distance: string;
  pickup: string;
  dropoff: string;
  pLat: number;
  pLon: number;
  dLat: number;
  dLon: number;
  vehicleType: string | null;
}) => {
  console.log("nearbyPartners", nearbyPartners);
  const router = useRouter();
  return (
    <div className="p-3 lg:p-5 pt-0 mt-auto shrink-0">
      <div
        className={`rounded-3xl border p-3 lg:p-4 ${
          mapTheme === "dark"
            ? "bg-black/40 border-white/10 backdrop-blur-xl"
            : "bg-white border-slate-200 shadow-lg"
        }`}
      >
        <div className="space-y-4">
          {nearbyPartners.map((partner) => {
            const estimatedFare =
              (partner.vehicle?.baseFare ?? 0) +
              parseFloat(distance) * (partner.vehicle?.pricePerKM ?? 0);
            const baseFare = partner?.vehicle?.baseFare ?? 0;
            const pricePerKM = partner?.vehicle?.pricePerKM ?? 0;
            const vehicleType = partner?.vehicle?.type ?? "";
            const waitingCharge = partner?.vehicle?.waitingCharge ?? 0;

            return (
              <div
                key={partner._id}
                className={`
                  rounded-3xl border overflow-hidden
                  transition-all duration-300
                  hover:scale-[1.02]
                  ${
                    mapTheme === "dark"
                      ? "bg-white/[0.03] border-white/10 hover:bg-white/[0.06]"
                      : "bg-slate-50 border-slate-200"
                  }
                `}
              >
                {/* Vehicle Image */}
                <div className="relative h-40 w-full">
                  <Image
                    src={
                      partner.vehicle?.vehiclePhoto?.url ||
                      "/bike-placeholder.jpg"
                    }
                    alt={partner.vehicle?.vehcleModel || "Vehicle"}
                    fill
                    className="object-cover"
                  />

                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 rounded-full text-white text-xs font-bold ${
                        partner.isOnline ? "bg-green-500" : "bg-gray-500"
                      }`}
                    >
                      {partner.isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>

                {/* Driver */}
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src={partner.image || "/default-user.png"}
                      alt={partner.name}
                      width={56}
                      height={56}
                      className="rounded-full border-2 border-blue-500 object-cover"
                    />

                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{partner.name}</h3>

                      <p className="text-sm text-slate-400">
                        {partner.vehicle?.vehcleModel}
                      </p>

                      <p className="text-xs text-slate-500">
                        {partner.vehicle?.number}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-yellow-400 font-bold">⭐ 4.9</p>

                      <p className="text-xs text-slate-400">Top Driver</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mt-5">
                    <div
                      className={`rounded-2xl p-3 text-center ${
                        mapTheme === "dark" ? "bg-white/5" : "bg-white"
                      }`}
                    >
                      <p className="text-xs text-slate-400">Distance</p>

                      <p className="font-bold">
                        {partner.distance < 1000
                          ? `${Math.round(partner.distance)} m`
                          : `${(partner.distance / 1000).toFixed(1)} km`}
                      </p>
                    </div>

                    <div
                      className={`rounded-2xl p-3 text-center ${
                        mapTheme === "dark" ? "bg-white/5" : "bg-white"
                      }`}
                    >
                      <p className="text-xs text-slate-400">ETA</p>

                      <p className="font-bold">
                        {Math.max(1, Math.round(partner.distance / 250))} min
                      </p>
                    </div>

                    <div
                      className={`rounded-2xl p-3 text-center ${
                        mapTheme === "dark" ? "bg-white/5" : "bg-white"
                      }`}
                    >
                      <p className="text-xs text-slate-400">Fare</p>

                      <p className="font-bold text-green-400">
                        ₹{estimatedFare.toFixed(0)}
                      </p>
                    </div>
                  </div>

                  {/* Fare Breakdown */}
                  <div
                    className={`mt-4 rounded-2xl p-3 ${
                      mapTheme === "dark" ? "bg-white/5" : "bg-slate-100"
                    }`}
                  >
                    <div className="flex justify-between text-sm">
                      <span>Base Fare</span>
                      <span>₹{partner.vehicle?.baseFare ?? 0}</span>
                    </div>

                    <div className="flex justify-between text-sm mt-1">
                      <span>Per KM</span>
                      <span>₹{partner.vehicle?.pricePerKM ?? 0}</span>
                    </div>

                    <div className="flex justify-between text-sm mt-1">
                      <span>Waiting</span>
                      <span>₹{partner.vehicle?.waitingCharge ?? 0}/min</span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 mt-5">
                    <button
                      disabled={!partner.isOnline}
                      className={`
                                  flex-1
                                  rounded-2xl
                                  py-3
                                  font-semibold
                                  transition-all
                                  ${
                                    partner.isOnline
                                      ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
                                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                  }
                      `}
                      onClick={() => {
                        const params = new URLSearchParams({
                          pickup,
                          dropoff,

                          pLat: String(pLat),
                          pLon: String(pLon),

                          dLat: String(dLat),
                          dLon: String(dLon),

                          vehicleType,

                          baseFare: String(partner.vehicle?.baseFare ?? 0),
                          pricePerKM: String(partner.vehicle?.pricePerKM ?? 0),
                          waitingCharge: String(
                            partner.vehicle?.waitingCharge ?? 0,
                          ),

                          partnerId: partner._id,
                          partnerName: partner.name,
                          partnerImage: partner.image ?? "",

                          vehicleId: partner.vehicle?._id ?? "",
                          vehicleModel: partner.vehicle?.vehcleModel ?? "",
                          vehicleNumber: partner.vehicle?.number ?? "",
                          mobileNumber: partner.mobileNumber ?? "",

                          distance: distance,
                        });

                        router.push(`/user/checkout?${params.toString()}`);
                      }}
                    >
                      Book Ride
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DeriverDetail;
