"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifyAndLogin, sendOtp } from "@/actions/auth";
import { Phone, Lock, ArrowRight, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [studentPhone, setStudentPhone] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [studentOtp, setStudentOtp] = useState("");
  const [parentOtp, setParentOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentPhone || !parentPhone) {
      setError("Please enter both phone numbers");
      return;
    }
    
    // Validate Indian phone numbers (10 digits, or with 91 / +91 prefix)
    const phoneRegex = /^(\+91|91)?\d{10}$/;
    if (!phoneRegex.test(studentPhone.replace(/\s+/g, '')) || !phoneRegex.test(parentPhone.replace(/\s+/g, ''))) {
      setError("Please enter valid 10-digit phone numbers (e.g., 9876543210)");
      return;
    }

    setError("");
    setLoading(true);

    const res = await sendOtp(studentPhone, parentPhone);
    if (res.success) {
      setShowOtpModal(true);
    } else {
      setError(res.error || "Failed to send OTP");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (studentOtp.length !== 6 || parentOtp.length !== 6) {
      setError("Please enter valid 6-digit OTPs");
      return;
    }
    setError("");
    setLoading(true);

    const res = await verifyAndLogin(studentPhone, parentPhone, studentOtp, parentOtp);
    if (res.success && res.redirect) {
      router.push(res.redirect);
    } else {
      setError(res.error || "Failed to login");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: "2s" }}></div>

      <div className="relative z-10 w-full max-w-md p-8 backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 mb-4 shadow-lg shadow-purple-500/30">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-indigo-200">
            Secure Portal
          </h1>
          <p className="text-white/60 mt-2 text-sm">Enter your phone numbers to continue</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            {error}
          </div>
        )}

        {!showOtpModal ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80 ml-1">Student Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-white/40" />
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all placeholder:text-white/30 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80 ml-1">Parent Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-white/40" />
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-white/30 text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Send OTP
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-center text-white/70">
              We've sent verification codes to both numbers.
              <br />
              (Any 6-digit number works for this demo)
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80 ml-1">Student OTP</label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  value={studentOtp}
                  onChange={(e) => setStudentOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="------"
                  className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all placeholder:text-white/30 text-white text-center tracking-[0.5em] font-mono text-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80 ml-1">Parent OTP</label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  value={parentOtp}
                  onChange={(e) => setParentOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="------"
                  className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-white/30 text-white text-center tracking-[0.5em] font-mono text-lg"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Verify & Continue
                  <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </>
              )}
            </button>
            
            <button 
              type="button" 
              onClick={() => setShowOtpModal(false)}
              className="w-full text-sm text-white/50 hover:text-white/80 transition-colors"
            >
              Back to phone numbers
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
