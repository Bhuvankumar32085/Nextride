"use client";

import { bookingApi } from "@/app/axios/bookingApi";
import { useAppSelector } from "@/app/redux/hooks";
import RidePage from "@/components/user/RidePage";
import { useEffect, useState } from "react";

export default function Page() {
  const { loggedUser } = useAppSelector((s) => s.user);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loggedUser?._id) return;
    const getUserRide = async () => {
      try {
        const { data } = await bookingApi.get(
          `${process.env.NEXT_PUBLIC_BOOKING_API}/user-ride/${loggedUser?._id}`,
        );

        if (data.success && data.data?._id) {
          setBookingId(data.data._id);
        }
      } catch (error) {
        console.error("GET USER RIDE ERROR", error);
      } finally {
        setLoading(false);
      }
    };

    getUserRide();
  }, [loggedUser?._id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading...
      </div>
    );
  }

  if (!bookingId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Booking Not Found</h1>
          <p className="text-slate-400 mt-3">
            You do not have any active ride.
          </p>
        </div>
      </div>
    );
  }

  return <RidePage bookingId={bookingId} />;
}
