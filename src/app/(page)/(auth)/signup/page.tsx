"use client";

import { motion, Variants } from "framer-motion";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import { User, Mail, Lock, ArrowRight, Loader2, ArrowLeft } from "lucide-react"; // ArrowLeft added

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
              : "border-white/[0.06] hover:border-white/10"
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

/* ── Main Page (Signup) ───────────────────────────────────────────── */
export default function SignupPage() {
  const [step, setStep] = useState<number>(0);
  const router = useRouter();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showGoogle, setShowGoogle] = useState<boolean>(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [veryfOtpLoading, setVeryfOtpLoading] = useState<boolean>(false);

  // OTP State & Timer State
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState<number>(300); // 300 seconds = 5 mins

  useEffect(() => {
    setShowGoogle(true);
  }, []);

  // Timer Logic
  useEffect(() => {
    if (step === 1 && timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [step, timeLeft]);

  // Handle OTP Inputs
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Allow only 1 character
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus to next input
    if (value !== "" && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  // Handle Backspace for OTP
  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleGoogleSuccess = async (res: CredentialResponse) => {
    try {
      setSubmitting(true);
      const { data } = await axios.post(
        "http://localhost:5000/api/v1/user/google-login",
        { token: res.credential },
      );
      localStorage.setItem("token", data.token);
      toast.success("Account created & signed in with Google! 🚀");
      router.push("/");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Google sign-up failed.";
        toast.error(message);
      } else {
        toast.error("An unexpected error occurred during Google sign-up.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill in all fields.");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post("http://localhost:5000/api/v1/user/register", form);
      toast.success("Account created successfully! Please verify OTP.");
      setStep(1); // Move to OTP step
      setTimeLeft(300); // Reset timer just in case
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || "Sign-up failed.";
        toast.error(message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Verify OTP Dummy function (You can add your API logic here)
  const handleVerifyOtp = async () => {
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      toast.error("Please enter complete 6-digit OTP");
      return;
    }
    try {
      setVeryfOtpLoading(true);
      await axios.post(`http://localhost:5001/api/v1/notification/verify-otp`, {
        otp: otpCode,
        email: form.email,
      });
      toast.success("Email Verified successfully! 🚀");
      router.push("/login");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "OTP verification failed.";
        toast.error(message);
      } else {
        toast.error("An unexpected error occurred during OTP verification.");
      }
    } finally {
      setVeryfOtpLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill in all fields.");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/v1/user/register", form);
      toast.success("OTP resent successfully!");
      setStep(1); // Move to OTP step
      setTimeLeft(300); // Reset timer just in case
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || "Sign-up failed.";
        toast.error(message);
      } else {
        toast.error("An unexpected error occurred.");
      }
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
                key="form"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col"
              >
                {/* ── STEP 0: REGISTRATION FORM ── */}
                {step === 0 && (
                  <>
                    {/* Heading */}
                    <motion.div variants={itemVariants} className="mb-5">
                      <h1 className="font-display text-[28px] font-bold text-white tracking-tight leading-tight">
                        Start your{" "}
                        <span className="bg-linear-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                          journey.
                        </span>
                      </h1>
                      <p className="text-xs text-slate-500 font-light mt-1.5">
                        Create your account and ride smarter.
                      </p>
                    </motion.div>

                    {/* Google Signup */}
                    <motion.div variants={itemVariants}>
                      {showGoogle && (
                        <div className="flex justify-center bg-white/4 rounded-xl p-2.5 border border-white/[0.07] hover:border-white/12 transition-colors">
                          <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() =>
                              toast.error("Google sign-up failed.")
                            }
                            theme="filled_black"
                            shape="pill"
                            text="signup_with"
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

                    <div className="flex flex-col gap-3">
                      <Field
                        label="Full Name"
                        type="text"
                        name="name"
                        placeholder="e.g. Alex Johnson"
                        value={form.name}
                        onChange={handleChange}
                        icon={<User className="w-4 h-4" />}
                      />
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
                        placeholder="Create a strong password"
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
                          Creating Account…
                        </>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  </>
                )}

                {/* ── STEP 1: OTP VERIFICATION ── */}
                {step === 1 && (
                  <motion.div variants={itemVariants} className="flex flex-col">
                    {/* Back Button & Heading */}
                    <div className="flex items-center gap-4 mb-8">
                      <button
                        onClick={() => setStep(0)}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                        title="Go Back"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <div>
                        <h2 className="font-display text-[24px] font-bold text-white tracking-tight leading-tight">
                          Verify Email
                        </h2>
                        <p className="text-xs text-slate-500 font-light mt-1">
                          Code sent to{" "}
                          <span className="font-medium text-slate-300">
                            {form.email}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* 6 OTP Boxes */}
                    <div className="flex justify-between gap-2 mb-6">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) =>
                            handleOtpChange(index, e.target.value)
                          }
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-slate-900/70 border border-white/[0.06] focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 text-white outline-none transition-all"
                        />
                      ))}
                    </div>

                    {/* 5 Min Timer */}
                    <div className="flex justify-center items-center gap-2 mb-8 text-sm">
                      <span className="text-slate-500">Time remaining:</span>
                      <span
                        className={`font-mono font-medium ${timeLeft < 60 ? "text-red-400" : "text-blue-400"}`}
                      >
                        {Math.floor(timeLeft / 60)
                          .toString()
                          .padStart(2, "0")}
                        :{(timeLeft % 60).toString().padStart(2, "0")}
                      </span>
                    </div>

                    {/* Verify Button */}
                    <motion.button
                      whileHover={{ scale: 1.015, y: -1 }}
                      whileTap={{ scale: 0.985 }}
                      onClick={handleVerifyOtp}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-emerald-600 to-teal-600 shadow-[0_3px_18px_rgba(16,185,129,0.2)] hover:shadow-[0_6px_24px_rgba(16,185,129,0.3)] transition-shadow duration-200"
                    >
                      {veryfOtpLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Verifying…
                        </>
                      ) : (
                        <>Verify OTP</>
                      )}
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>

                    {/* Resend Option */}
                    <div className="text-center mt-6">
                      <button
                        disabled={timeLeft > 0}
                        className={`text-xs font-semibold transition-colors ${timeLeft > 0 ? "text-slate-600 cursor-not-allowed" : "text-blue-400 hover:text-blue-300"}`}
                        onClick={resendOtp}
                      >
                        Resend Code
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Terms */}
                <motion.p
                  variants={itemVariants}
                  className="text-center text-[10px] text-slate-600 mt-6 leading-relaxed"
                >
                  By signing up you agree to our{" "}
                  <a
                    href="#"
                    className="text-blue-400/70 hover:text-blue-400 transition-colors"
                  >
                    Terms
                  </a>{" "}
                  &amp;{" "}
                  <a
                    href="#"
                    className="text-blue-400/70 hover:text-blue-400 transition-colors"
                  >
                    Privacy Policy
                  </a>
                  .
                </motion.p>

                {/* Sign in link */}
                <motion.div
                  variants={itemVariants}
                  className="mt-4 pt-4 border-t border-white/5 text-center"
                >
                  <span className="text-xs text-slate-500">
                    Already have an account?
                  </span>
                  <Link
                    href="/login"
                    className="ml-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Sign in →
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
