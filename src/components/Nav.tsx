"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Menu,
  LogOut,
  User as UserIcon,
  Handshake,
  PercentDiamond,
  BookImageIcon,
  Clock3,
  CarTaxiFront,
  MapPinned,
  BarChart3,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import MobileMenu from "./MobileMenu";
import { setLoggedUser } from "@/app/redux/selices/userSlices";
import { authApi } from "@/app/axios/authApi";
import { socket } from "@/realtime/socket";
import { useRouter } from "next/navigation";

// --- Main Navbar Component ---
export default function Navbar() {
  const { loggedUser } = useAppSelector((state) => state.user);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Close desktop profile dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

  const isAdmin = loggedUser?.role === "admin";
  const isPartner = loggedUser?.role === "partner";
  const isUser = loggedUser?.role === "user";

  const handleLogout = async () => {
    localStorage.removeItem("token");
    await authApi.post("/logout");
    dispatch(setLoggedUser(null));
    toast.success("Logged out successfully! 👋");
    socket.disconnect();
    window.location.reload();
  };

  const userImage = loggedUser?.image;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-40 bg-[#020617]/85 backdrop-blur-xl border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* ── CSS-Only Logo ── */}
          <Link
            href="/"
            className="flex items-center gap-3 group relative z-50"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-b from-slate-800 to-[#020617] border border-slate-700/50 shadow-[0_0_15px_rgba(59,130,246,0.1)] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.25)] transition-shadow duration-300">
              <div className="absolute w-1.5 h-4.5 bg-blue-500 rounded-full left-2.5 translate-y-0.5" />
              <div className="absolute w-1.5 h-4.5 bg-violet-500 rounded-full right-2.5 -translate-y-0.5" />
              <div className="absolute w-1 h-5.5 bg-blue-400 rotate-40 rounded-full" />
            </div>

            <div className="font-display text-2xl tracking-tight flex items-center">
              <span className="font-extrabold text-white">Next</span>
              <span className="font-medium text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-violet-400">
                Ride
              </span>
            </div>
          </Link>

          {/* ── Desktop Auth / Profile ── */}
          <div className="hidden md:flex items-center gap-5">
            {!loggedUser ? (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="relative group overflow-hidden py-2.5 px-6 rounded-full text-sm font-semibold text-white bg-slate-900 border border-slate-700 hover:border-blue-500/50 shadow-[0_0_15px_rgba(0,0,0,0.8)] transition-all duration-300"
                >
                  <span className="absolute inset-0 w-full h-full bg-linear-to-r from-blue-600/20 to-violet-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10">Signup</span>
                </Link>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="relative flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 overflow-hidden shadow-[0_0_10px_rgba(0,0,0,0.5)] focus:outline-none"
                >
                  {userImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={userImage}
                      alt={loggedUser.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-sm font-bold text-transparent bg-clip-text bg-linear-to-br from-blue-400 to-violet-400 uppercase">
                      {loggedUser.name?.charAt(0) || "U"}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 mt-3 w-64 bg-slate-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden"
                    >
                      <div className="p-4 border-b border-white/5 bg-white/2">
                        <p className="text-sm font-bold text-white truncate">
                          {loggedUser.name}
                        </p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {loggedUser.email}
                        </p>
                        <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] font-mono text-blue-400 uppercase tracking-wider">
                          {loggedUser.role || "User"}
                        </div>
                      </div>
                      <div className="p-2 flex flex-col gap-1">
                        {isUser && (
                          <>
                            <Link
                              href="/partner/onboarding/vehicle"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              <Handshake className="w-4 h-4 text-slate-400" />
                              Become a Partner
                            </Link>
                            <button
                              onClick={() => router.push("/user/active-ride")}
                              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              <MapPinned className="w-4 h-4 text-slate-400 " />
                              Active Ride
                            </button>
                          </>
                        )}
                        {isPartner && (
                          <>
                            <button
                              onClick={() =>
                                router.push("/partner/pending-request")
                              }
                              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              <Clock3 className="w-4 h-4 text-slate-400 " />
                              Pending Requests
                            </button>
                            <button
                              onClick={() => router.push("/partner/bookings")}
                              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              <CarTaxiFront className="w-4 h-4 text-slate-400 " />
                              Booking
                            </button>
                            <button
                              onClick={() =>
                                router.push("/partner/active-ride")
                              }
                              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              <MapPinned className="w-4 h-4 text-slate-400 " />
                              Active Ride
                            </button>
                          </>
                        )}
                        {isAdmin && (
                          // Revenue Analytics
                          <button
                            onClick={() =>
                              router.push("/admin/revenue-analytics")
                            }
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <BarChart3 className="w-4 h-4 text-slate-400 " />
                            Revenue Analytics
                          </button>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-red-400 hover:bg-red-500/10 transition-colors w-full text-left"
                        >
                          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-400" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* ── Mobile Hamburger Button ── */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden relative z-50 p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors focus:outline-none"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </motion.nav>

      {/* Render Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        closeMenu={() => setIsMobileMenuOpen(false)}
        loggedUser={loggedUser}
        handleLogout={handleLogout}
      />
    </>
  );
}
