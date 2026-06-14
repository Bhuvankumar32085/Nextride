import RidePage from "@/components/user/RidePage";
import { cookies } from "next/headers";

async function getUserRide() {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("token")?.value;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BOOKING_API}/user-ride`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    const data = await res.json();

    if (!data.success || !data.data?._id) {
      return null;
    }

    return data.data._id;
  } catch (error) {
    console.error("GET USER RIDE ERROR", error);
    return null;
  }
}

const Page = async () => {
  const bookingId = await getUserRide();

  if (!bookingId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold">
            Booking Not Found
          </h1>

          <p className="text-slate-400 mt-3">
            You do not have any active ride.
          </p>
        </div>
      </div>
    );
  }

  return <RidePage bookingId={bookingId} />;
};

export default Page;