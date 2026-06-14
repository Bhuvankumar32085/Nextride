"use client";

import { useEffect } from "react";
import { socket } from "@/realtime/socket";

const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const token = localStorage.getItem("token");
    let watchId: number | null = null;

    if (token) {
      socket.auth = {
        token,
      };

      socket.connect();

      socket.on("connect", () => {

        if ("geolocation" in navigator) {
          watchId = navigator.geolocation.watchPosition(
            (position) => {
              const { latitude, longitude } = position.coords;

              socket.emit("user:location:update", {
                lat: latitude,
                lon: longitude,
                timestamp: Date.now(),
              });
            },
            (error) => {
              console.log("Location Error:", error.message);
            },
            {
              enableHighAccuracy: true,
              maximumAge: 5000,
              timeout: 10000,
            },
          );
        }
      });

      socket.on("disconnect", () => {
      });

      socket.on("connect_error", (err) => {
        console.log("Socket Error:", err.message);
      });
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }

      socket.disconnect();
    };
  }, []);

  return <>{children}</>;
};

export default SocketProvider;
