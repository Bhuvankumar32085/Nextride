"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import {
  MapPin,
  Navigation,
  ArrowLeft,
  ShieldCheck,
  Star,
  Receipt,
  User,
  Bike,
  Compass,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
} from "lucide-react";
import { BookingStatusOverlay } from "@/components/user/BookingStatusOverlay";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { bookingApi } from "@/app/axios/bookingApi";
import axios from "axios";
import toast from "react-hot-toast";
import { authApi } from "@/app/axios/authApi";
import { setLoggedUser } from "@/app/redux/selices/userSlices";
import { socket } from "@/realtime/socket";
import ChackoutPageButton from "@/components/user/ChackoutPageButton";
import PaymentCountdown from "@/components/user/PaymentCountdown";

export type Status =
  | "idle"
  | "requested"
  | "awaiting_payment"
  | "confirmed"
  | "started"
  | "completed"
  | "cancelled"
  | "rejected"
  | "expired";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 15 },
  },
};

const Page = () => {
  const { loggedUser } = useAppSelector((store) => store.user);
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const [bookingStatus, setBookingStatus] = useState<Status>("idle");

  const pickup = searchParams.get("pickup") || "Pickup Location";
  const dropoff = searchParams.get("dropoff") || "Destination";

  const pLat = searchParams.get("pLat");
  const pLon = searchParams.get("pLon");
  const dLat = searchParams.get("dLat");
  const dLon = searchParams.get("dLon");

  const vehicleType = searchParams.get("vehicleType") || "bike";

  const baseFare = Number(searchParams.get("baseFare")) || 0;
  const pricePerKM = Number(searchParams.get("pricePerKM")) || 0;
  const waitingCharge = Number(searchParams.get("waitingCharge")) || 0;

  const partnerId = searchParams.get("partnerId");
  const partnerName = searchParams.get("partnerName") || "Partner Driver";
  const partnerImage =
    searchParams.get("partnerImage") || "https://i.pravatar.cc/150?img=11";

  const vehicleId = searchParams.get("vehicleId");
  const vehicleModel = searchParams.get("vehicleModel") || "Vehicle Model";
  const vehicleNumber = searchParams.get("vehicleNumber") || "UP20BHXXXX";
  const driverMobileNumber = searchParams.get("mobileNumber") || "UP20BHXXXX";

  const distanceStr = searchParams.get("distance") || "0 KM";
  const distanceNum = parseFloat(distanceStr.replace(/[^0-9.]/g, "")) || 0;

  const distanceFare = Math.round(distanceNum * pricePerKM);
  const [totalFare, setTotalFare] = useState(baseFare + distanceFare);

  const pickupLocation = [Number(pLon), Number(pLat)];
  const dropLocation = [Number(dLon), Number(dLat)];
  const [userMobileNumber, setMobileNumber] = useState("");
  const [bookingId, setBookingID] = useState("");
  const [paymentMethodForFatching, setPaymentMathodForFatching] = useState<
    "Cod" | "Online" | "Start"
  >("Start");
  const [paymentStatusForOnline, setPaymentStatusForOnline] = useState<
    "pending" | "paid" | "failed"
  >("pending");
  const [paymetDeadline, setpaymetDeadline] = useState<
    string | Date | undefined
  >();
  const [showPaymentModel, setPaymentModel] = useState<boolean>(false);

  const handleAddMobileNumber = async () => {
    if (userMobileNumber?.length !== 10) {
      toast.error("Please enter valid mobile number");
      return;
    }
    try {
      const { data } = await authApi.post(
        "/add-user-mobileNumber",
        { mobileNumber: userMobileNumber },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      dispatch(setLoggedUser(data.data));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Add mobile Number Error.",
        );
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const { data } = await bookingApi.post(
        "/create-booking",
        {
          partnerId,
          vehicleId,
          pickup,
          dropoff,
          pricePerKM,
          driverMobileNumber,
          pickupLocation,
          dropLocation,
          userMobileNumber,
          baseFare,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );

      console.log("bookingStatus", data);

      if (data.success) {
        setBookingStatus(data.data.bookingStatus);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Create Booking Error.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (loggedUser?.mobileNumber) {
      setMobileNumber(loggedUser.mobileNumber);
    }
    if (
      bookingStatus == "awaiting_payment" &&
      paymentStatusForOnline !== "paid"
    ) {
      setPaymentModel(true);
    } else {
      setPaymentModel(false);
    }
  }, [loggedUser, bookingStatus]);

  useEffect(() => {
    socket.on("NOTIFY_USER_FOR_ACCEPT_BOOKING_BY_PARTNER", (data) => {
      if (data.booking.bookingStatus == "awaiting_payment") {
        setBookingStatus(data.booking.bookingStatus);
        setpaymetDeadline(data.booking.paymentDeadline);
        setTotalFare(baseFare + distanceFare);
        setBookingID(data.booking._id);
      } else if (data.booking.bookingStatus == "rejected") {
        setBookingStatus(data.booking.bookingStatus);
      }
      toast.success("Driver accepted your ride request");
    });
    return () => {
      socket.off("NOTIFY_USER_FOR_ACCEPT_BOOKING_BY_PARTNER");
    };
  }, []);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!vehicleId || !partnerId) return;
      try {
        const { data } = await bookingApi.get(
          `/my-active-booking/${vehicleId}/${partnerId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        if (data.data) {
          setBookingID(data.data._id);
          setpaymetDeadline(data.data.paymentDeadline);
          setPaymentStatusForOnline(data.data.paymentStatusForOnline);
          if (data.data.paymentMethod === "cod") {
            setPaymentMathodForFatching("Cod");
          } else if (data.data.paymentMethod === "online") {
            setPaymentMathodForFatching("Online");
          }
          setBookingStatus(data.data.bookingStatus);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchBooking();
  }, [partnerId, vehicleId]);

  const handleCancleRide = async () => {
    if (!bookingId) return;
    try {
      await bookingApi.patch(
        `/cancle/${bookingId}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      router.back();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "cancel booking error.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white font-sans relative overflow-x-hidden selection:bg-blue-500/30">
      {/* Background Subtle Mesh Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-[800px] w-[800px] rounded-full bg-blue-600/10 blur-[200px]" />
        <div className="absolute bottom-[5%] right-[-5%] h-[600px] w-[600px] rounded-full bg-cyan-500/10 blur-[150px]" />
        <div className="absolute top-[40%] left-[30%] h-[500px] w-[500px] rounded-full bg-purple-600/5 blur-[150px]" />
      </div>

      {/* Navbar Container */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-5 md:py-6 flex items-center justify-between border-b border-white/5 bg-slate-950/40 backdrop-blur-xl">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-300 backdrop-blur-xl transition-all hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft size={16} />
          Back
        </motion.button>

        <motion.span
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-[10px] sm:text-xs font-black tracking-widest text-slate-500 uppercase flex items-center gap-2 font-mono"
        >
          <ShieldCheck size={14} className="text-blue-500" /> 256-bit Encrypted
          Session
        </motion.span>
      </header>

      {/* Main Core Responsive Content Grid Layout */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start"
        >
          {/* LEFT COLUMN: Structural Details Matrix */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header Text Block Section */}
            <motion.div variants={cardVariants} className="space-y-1">
              <span className="text-xs font-black tracking-widest text-blue-500 uppercase font-mono block">
                Session Overview
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
                Confirm Transit Node
              </h1>
            </motion.div>

            {/* EMBEDDED PERMANENT LIVE COMPONENT SECTION */}
            <motion.div variants={cardVariants} className="relative group">
              <div className="absolute inset-0 rounded-[32px] bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl pointer-events-none" />
              <BookingStatusOverlay
                status={bookingStatus}
                partnerName={partnerName}
              />
            </motion.div>

            {/* Address Path Routing Card Panel */}
            <motion.div
              variants={cardVariants}
              className="rounded-[32px] border border-white/5 bg-slate-900/40 backdrop-blur-2xl hover:bg-slate-900/60 hover:border-white/10 transition-all duration-300 p-6 sm:p-8 relative overflow-hidden group shadow-lg"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000 text-blue-500">
                <Compass size={160} />
              </div>

              <h2 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-6 flex items-center gap-2 font-mono">
                <Compass size={14} className="text-blue-500" /> Route
                Coordinates
              </h2>

              <div className="space-y-8 relative">
                <div className="absolute left-[19px] top-[32px] bottom-[32px] w-[2px] bg-gradient-to-b from-blue-500 via-cyan-400 to-emerald-500 opacity-30 shadow-[0_0_10px_rgba(56,189,248,0.4)]" />

                <div className="flex items-start gap-5 group/item">
                  <div className="rounded-2xl bg-blue-500/10 border border-blue-500/30 p-2.5 shrink-0 z-10 transition-transform duration-300 group-hover/item:scale-105 shadow-inner">
                    <MapPin className="text-blue-400" size={18} />
                  </div>
                  <div className="space-y-1 pt-1">
                    <h4 className="text-[10px] font-black tracking-widest text-slate-500 uppercase font-mono">
                      Pickup Vector
                    </h4>
                    <p className="text-slate-200 text-sm font-medium leading-relaxed">
                      {pickup}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-5 group/item">
                  <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-2.5 shrink-0 z-10 transition-transform duration-300 group-hover/item:scale-105 shadow-inner">
                    <Navigation className="text-emerald-400" size={18} />
                  </div>
                  <div className="space-y-1 pt-1">
                    <h4 className="text-[10px] font-black tracking-widest text-slate-500 uppercase font-mono">
                      Destination Drop
                    </h4>
                    <p className="text-slate-200 text-sm font-medium leading-relaxed">
                      {dropoff}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Driver Match Card Profile Setup Box */}
            <motion.div
              variants={cardVariants}
              className="rounded-[32px] border border-white/5 bg-slate-900/40 backdrop-blur-2xl hover:bg-slate-900/60 hover:border-white/10 transition-all duration-300 p-6 sm:p-8 shadow-lg"
            >
              <h2 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-5 flex items-center gap-2 font-mono">
                <User size={14} className="text-purple-500" /> Fleet Assignment
              </h2>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 p-5 rounded-3xl bg-black/40 border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center gap-5 relative z-10">
                  <div className="relative shrink-0">
                    <Image
                      src={partnerImage || "/default-user.png"}
                      alt={partnerName || "Driver"}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-[20px] border border-white/10 object-cover bg-slate-900 shadow-xl"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-green-400 to-emerald-600 text-[9px] font-black text-white px-2 py-0.5 rounded-full border border-slate-950 flex items-center gap-1 shadow-lg">
                      4.9 <Star size={8} fill="currentColor" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-black text-lg text-white tracking-tight">
                      {partnerName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-lg text-slate-300 font-mono font-bold capitalize tracking-wider shadow-inner">
                        {vehicleType}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                        <CheckCircle2 size={12} className="text-blue-500" />{" "}
                        Verified Node
                      </span>
                    </div>
                  </div>
                </div>

                <div className="sm:text-right w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-white/10 flex sm:flex-col justify-between items-center sm:items-end gap-1.5 relative z-10">
                  <span className="text-[10px] text-slate-500 tracking-widest font-black font-mono uppercase block">
                    Hardware Spec
                  </span>
                  <p className="font-bold text-sm text-slate-200 capitalize tracking-wide">
                    {vehicleModel}
                  </p>
                  <span className="mt-1 text-xs px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 font-mono font-black tracking-widest shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                    {vehicleNumber}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Price Breakup & Invoice Blocks */}
          <div className="lg:col-span-5 md:mt-2 lg:mt-0">
            <motion.div
              variants={cardVariants}
              className="rounded-[32px] border border-white/5 bg-slate-900/40 backdrop-blur-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)] relative sticky top-6 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* --- DYNAMIC REAL-TIME PAYMENT DEADLINE COUNTDOWN BANNER --- */}
              {bookingStatus === "awaiting_payment" && paymetDeadline && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="mb-8 p-5 rounded-[24px] bg-amber-500/10 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)] backdrop-blur-xl relative z-10"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-3.5 items-center">
                        <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 animate-pulse shadow-inner">
                          <Clock size={18} />
                        </div>
                        <div>
                          <h4 className="text-[11px] font-black text-amber-400 uppercase tracking-widest font-mono">
                            Action Required
                          </h4>
                          <p className="text-xs text-slate-300 mt-0.5 font-medium">
                            Complete ledger verification
                          </p>
                        </div>
                      </div>
                      <PaymentCountdown
                        deadline={paymetDeadline}
                        onExpire={() => setBookingStatus("expired")}
                      />
                    </div>
                    <button
                      onClick={handleCancleRide}
                      className="w-full py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-xs uppercase tracking-widest hover:bg-red-500/20 transition-all duration-300"
                    >
                      Abort Session
                    </button>
                  </div>
                </motion.div>
              )}

              <h2 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-6 flex items-center gap-2 font-mono relative z-10">
                <Receipt size={14} className="text-blue-500" /> Invoice
                Breakdown
              </h2>

              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center text-sm border-b border-white/5 pb-4">
                  <span className="text-slate-400 font-medium">
                    Base Compute Fare
                  </span>
                  <span className="font-bold font-mono text-slate-200 tracking-wide">
                    ₹{baseFare.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-start text-sm border-b border-white/5 pb-4">
                  <div className="space-y-1">
                    <span className="text-slate-400 font-medium block">
                      Distance Matrix Fare
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold font-mono tracking-widest uppercase">
                      ({distanceStr} × ₹{pricePerKM}/KM)
                    </span>
                  </div>
                  <span className="font-bold font-mono text-slate-200 mt-0.5 tracking-wide">
                    ₹{distanceFare.toFixed(2)}
                  </span>
                </div>

                {waitingCharge > 0 && (
                  <div className="flex justify-between items-center text-sm border-b border-white/5 pb-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 font-medium">
                        Node Waiting Charges
                      </span>
                      <div className="relative group/tooltip">
                        <button
                          type="button"
                          className="text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          <HelpCircle size={14} />
                        </button>
                        <div className="absolute left-0 bottom-6 w-64 p-4 rounded-[20px] bg-slate-900 border border-slate-700 text-[11px] text-slate-300 shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-300 z-50 leading-relaxed backdrop-blur-xl">
                          Waiting charges are <b>not included</b> in the default
                          total setup. Applied dynamically at{" "}
                          <span className="text-green-400 font-bold font-mono">
                            ₹{waitingCharge}/min
                          </span>{" "}
                          bounds separate billing if driver endures delays.
                        </div>
                      </div>
                    </div>
                    <span className="font-bold font-mono text-slate-200 tracking-wide">
                      ₹{waitingCharge.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4">
                  <div className="space-y-1">
                    <span className="text-sm font-black text-white block uppercase tracking-widest">
                      Total Ledger
                    </span>
                    <span className="text-[10px] text-emerald-400/80 font-mono tracking-widest font-bold uppercase">
                      Net Inclusive Taxes
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-black font-mono bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(34,211,238,0.2)] tracking-tighter">
                      ₹{totalFare}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-start gap-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 text-[11px] text-slate-400 leading-relaxed relative z-10 shadow-inner">
                <AlertCircle
                  size={16}
                  className="text-blue-400 shrink-0 mt-0.5"
                />
                <p>
                  By confirming this ride ticket, you agree to our standard
                  premium logistics compliance policies and automated fair-rate
                  route calculations.
                </p>
              </div>

              <div className="relative z-10">
                <ChackoutPageButton
                  loggedUser={loggedUser}
                  userMobileNumber={userMobileNumber}
                  setMobileNumber={setMobileNumber}
                  handleAddMobileNumber={handleAddMobileNumber}
                  showPaymentModel={showPaymentModel}
                  isProcessing={isProcessing}
                  bookingStatus={bookingStatus}
                  handlePayment={handlePayment}
                  totalFare={totalFare}
                  bookingId={bookingId}
                  setpaymetDeadline={setpaymetDeadline}
                  setPaymentMathodForFatching={setPaymentMathodForFatching}
                  paymentMethodForFatching={paymentMethodForFatching}
                  setPaymentStatusForOnline={setPaymentStatusForOnline}
                  paymentStatusForOnline={paymentStatusForOnline}
                  setBookingStatus={setBookingStatus}
                />
              </div>

              {/* Secure Trust Grid Seal Badges */}
              <div className="mt-8 grid grid-cols-3 gap-3 text-center text-[9px] font-black tracking-widest text-slate-500 uppercase font-mono relative z-10">
                <div className="p-3 border border-white/5 rounded-2xl bg-black/20 flex flex-col items-center justify-center gap-1.5 shadow-inner">
                  <CheckCircle2 size={14} className="text-blue-500" /> Insured
                  Transit
                </div>
                <div className="p-3 border border-white/5 rounded-2xl bg-black/20 flex flex-col items-center justify-center gap-1.5 shadow-inner">
                  <CheckCircle2 size={14} className="text-blue-500" /> Top
                  Partner
                </div>
                <div className="p-3 border border-white/5 rounded-2xl bg-black/20 flex flex-col items-center justify-center gap-1.5 shadow-inner">
                  <CheckCircle2 size={14} className="text-blue-500" /> 24/7
                  Security
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Page;
