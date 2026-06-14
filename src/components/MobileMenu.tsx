"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, LogOut, User as UserIcon, ChevronRight } from "lucide-react";
import { IUser } from "@/app/types";

const MobileMenu = ({
  isOpen,
  closeMenu,
  loggedUser,
  handleLogout,
}: {
  isOpen: boolean;
  closeMenu: () => void;
  loggedUser: IUser | null;
  handleLogout: () => void;
}) => {
  const userImage = loggedUser?.image;

  const isAdmin = loggedUser?.role === "admin";
  const isPartner = loggedUser?.role === "partner";
  const isUser = loggedUser?.role === "user";
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeMenu}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-[#020617]/95 backdrop-blur-3xl border-l border-white/10 z-50 md:hidden flex flex-col shadow-2xl"
          >
            {/* Header / User Profile Section */}
            <div className="p-6 border-b border-white/10 bg-white/2">
              <div className="flex justify-between items-start mb-6">
                <span className="font-display text-xl font-bold text-white tracking-tight">
                  Menu
                </span>
                <button
                  onClick={closeMenu}
                  className="p-1.5 rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {loggedUser ? (
                <div className="flex items-center gap-4">
                  <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700/50 overflow-hidden shadow-lg">
                    {userImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={userImage}
                        alt={loggedUser.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-lg font-bold text-transparent bg-clip-text bg-linear-to-br from-blue-400 to-violet-400 uppercase">
                        {loggedUser.name?.charAt(0) || "U"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-white truncate">
                      {loggedUser.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {loggedUser.email}
                    </p>
                    <span className="mt-1.5 inline-block px-2 py-0.5 rounded border border-blue-500/20 bg-blue-500/10 text-[9px] font-mono text-blue-400 uppercase tracking-widest">
                      {loggedUser.role || "User"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="w-full py-3 text-center rounded-xl text-sm font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={closeMenu}
                    className="w-full py-3 text-center rounded-xl text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-violet-600 shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>

            {isAdmin && (
              <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
                {[{ name: "Home", href: "/" }].map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={closeMenu}
                    className="flex items-center justify-between p-4 rounded-xl text-slate-300 font-medium hover:text-white hover:bg-white/5 transition-all"
                  >
                    {link.name}
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </Link>
                ))}
              </div>
            )}
            {isUser && (
              <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
                {[
                  { name: "Home", href: "/" },
                  {
                    name: "Become a Partner",
                    href: "/partner/onboarding/vehicle",
                  },
                ].map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={closeMenu}
                    className="flex items-center justify-between p-4 rounded-xl text-slate-300 font-medium hover:text-white hover:bg-white/5 transition-all"
                  >
                    {link.name}
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </Link>
                ))}
              </div>
            )}
            {isPartner && (
              <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
                {[
                  { name: "Home", href: "/" },
                  { name: "Bookings", href: "/bookings" },
                  { name: "Pending equest", href: "/pending-request" },
                  { name: "Active Ride", href: "/active-ride" },
                ].map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={closeMenu}
                    className="flex items-center justify-between p-4 rounded-xl text-slate-300 font-medium hover:text-white hover:bg-white/5 transition-all"
                  >
                    {link.name}
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </Link>
                ))}
              </div>
            )}

            {/* Bottom Section (Logout / Settings if logged in) */}
            {loggedUser && (
              <div className="p-6 border-t border-white/10 flex flex-col gap-2">
                <button
                  onClick={() => {
                    closeMenu();
                    handleLogout();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
