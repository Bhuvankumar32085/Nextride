"use client";

import { motion, Variants } from "framer-motion";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { authApi } from "@/app/axios/authApi";
import { setLoggedUser } from "@/app/redux/selices/userSlices";
import { useAppDispatch } from "@/app/redux/hooks";

/* ── Types ────────────────────────────────────────────────────────── */
interface FieldProps {
  label: string;
  type: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
}

/* ── Variants ─────────────────────────────────────────────────────── */
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.07,
      delayChildren: 0.15,
    },
  },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ── Floating Orbs ────────────────────────────────────────────────── */
function Orbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {[
        {
          cls: "w-96 h-96 left-[5%] top-[8%]",
          color: "rgba(37,99,235,0.18)",
          dur: "15s",
        },
        {
          cls: "w-64 h-64 left-[68%] top-[4%]",
          color: "rgba(99,102,241,0.14)",
          dur: "18s",
        },
        {
          cls: "w-56 h-56 left-[75%] top-[60%]",
          color: "rgba(14,165,233,0.12)",
          dur: "21s",
        },
        {
          cls: "w-40 h-40 left-[2%] top-[68%]",
          color: "rgba(59,130,246,0.11)",
          dur: "24s",
        },
      ].map((o, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${o.cls}`}
          style={{
            background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
            filter: "blur(50px)",
            animation: `floatOrb ${o.dur} ease-in-out infinite`,
            animationDelay: `${i * 2}s`,
          }}
        />
      ))}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.022) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}

/* ── Input Field ──────────────────────────────────────────────────── */
function Field({
  label,
  type,
  name,
  placeholder,
  value,
  onChange,
  icon,
}: FieldProps) {
  const [focused, setFocused] = useState<boolean>(false);
  const filled = value.length > 0;

  return (
    <motion.div variants={itemVariants} className="flex flex-col gap-1">
      <label
        className={`text-[9px] font-medium tracking-widest uppercase font-mono transition-colors duration-200 ${
          focused ? "text-blue-400" : "text-slate-500"
        }`}
      >
        {label}
      </label>
      <div className="relative">
        <span
          className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
            focused ? "text-blue-400" : "text-slate-600"
          }`}
        >
          {icon}
        </span>
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full py-2.5 pl-9 pr-8 rounded-xl text-sm text-slate-200 bg-slate-900/70 border outline-none transition-all duration-200 placeholder:text-slate-600 ${
            focused
              ? "border-blue-500/40 ring-2 ring-blue-500/10"
              : "border-white/6 hover:border-white/10"
          }`}
        />
        {filled && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400"
          />
        )}
      </div>
    </motion.div>
  );
}

/* ── Main Page (Login) ────────────────────────────────────────────── */
export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showGoogle, setShowGoogle] = useState<boolean>(false);
  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => {
    setShowGoogle(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleGoogleSuccess = async (res: CredentialResponse) => {
    try {
      setSubmitting(true);
      const { data } = await authApi.post("/google-login", {
        token: res.credential,
      });
      localStorage.setItem("token", data.token);
      toast.success("Signed in with Google! ");

      //  immediately fetch user
      const userRes = await authApi.get("/current-user", {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      dispatch(setLoggedUser(userRes.data.user));
      router.push("/");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Google sign-in failed.";
        toast.error(message);
      } else {
        toast.error("An unexpected error occurred during Google sign-in.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      toast.error("Please provide email and password.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await authApi.post("/login", form);
      localStorage.setItem("token", res.data.token);
      toast.success("Login Successful ");
      //  immediately fetch user
      const userRes = await authApi.get("/current-user", {
        headers: {
          Authorization: `Bearer ${res.data.token}`,
        },
      });

      dispatch(setLoggedUser(userRes.data.user));
      router.push("/");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ||
          "Login failed. Check your credentials.";
        toast.error(message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@600;700&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
        body { font-family: 'DM Sans', sans-serif; }
        @keyframes floatOrb {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(28px,-22px) scale(1.07); }
          66%      { transform: translate(-18px,18px) scale(0.95); }
        }
        .font-display     { font-family: 'Clash Display', sans-serif; }
        .font-mono-custom { font-family: 'DM Mono', monospace; }
      `}</style>

      <div className="relative min-h-screen bg-[#020617] flex items-center justify-center p-4 overflow-hidden">
        <Orbs />

        <div className="relative z-10 flex items-center gap-10 w-full max-w-3xl">
          {/* ── Form Card ── */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 max-w-97.5 w-full mx-auto relative"
          >
            <div className="absolute -inset-px rounded-[22px] bg-linear-to-br from-blue-600/35 via-violet-600/15 to-blue-600/[0.07] -z-10" />

            <div className="bg-slate-950/93 backdrop-blur-2xl rounded-[22px] p-7 border border-white/5.5">
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col"
              >
                {/* Logo Mobile */}
                <motion.div
                  variants={itemVariants}
                  className="flex lg:hidden items-center gap-2 mb-4"
                >
                  <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                    <Image
                      src="/icon2.png"
                      alt="Next Ride Logo"
                      width={54}
                      height={54}
                      className="object-contain"
                    />
                  </div>
                  <span className="font-mono-custom text-[11px] font-medium text-slate-400/70 tracking-wider">
                    Next Ride
                  </span>
                </motion.div>

                {/* Heading */}
                <motion.div variants={itemVariants} className="mb-5">
                  <h1 className="font-display text-[28px] font-bold text-white tracking-tight leading-tight">
                    Welcome{" "}
                    <span className="bg-linear-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                      Back.
                    </span>
                  </h1>
                  <p className="text-xs text-slate-500 font-light mt-1.5">
                    Sign in to continue your journey.
                  </p>
                </motion.div>

                {/* Google Login */}
                <motion.div variants={itemVariants}>
                  {showGoogle && (
                    <div className="flex justify-center bg-white/4 rounded-xl p-2.5 border border-white/[0.07] hover:border-white/12 transition-colors">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => toast.error("Google sign-in failed.")}
                        theme="filled_black"
                        shape="pill"
                        text="signin_with"
                      />
                    </div>
                  )}
                </motion.div>

                {/* Divider */}
                <motion.div
                  variants={itemVariants}
                  className="flex items-center gap-3 my-4"
                >
                  <div className="flex-1 h-px bg-white/[0.07]" />
                  <span className="font-mono-custom text-[9px] tracking-widest uppercase text-slate-600">
                    or with email
                  </span>
                  <div className="flex-1 h-px bg-white/[0.07]" />
                </motion.div>

                {/* Fields */}
                <div className="flex flex-col gap-3">
                  <Field
                    label="Email Address"
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={handleChange}
                    icon={<Mail className="w-4 h-4" />}
                  />
                  <Field
                    label="Password"
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    icon={<Lock className="w-4 h-4" />}
                  />
                </div>

                {/* Submit Button */}
                <motion.button
                  variants={itemVariants}
                  whileHover={!submitting ? { scale: 1.015, y: -1 } : {}}
                  whileTap={!submitting ? { scale: 0.985 } : {}}
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-blue-700 via-blue-600 to-indigo-600 shadow-[0_3px_18px_rgba(37,99,235,0.32)] hover:shadow-[0_6px_24px_rgba(37,99,235,0.42)] transition-shadow duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing In…
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>

                {/* Sign up link */}
                <motion.div
                  variants={itemVariants}
                  className="mt-5 pt-4 border-t border-white/5.5 text-center"
                >
                  <span className="text-xs text-slate-500">
                    Don&lsquo;t have an account?
                  </span>
                  <Link
                    href="/signup"
                    className="ml-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Sign up →
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
