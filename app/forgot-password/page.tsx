"use client";
import { useState } from "react";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSubmitted(true);
        toast.success("Reset instructions have been sent to your email.");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to send reset email.");
      }
    } catch (err) {
      toast.error("An error occurred.");
    } finally {
      setLoading(false);
    }
  }

  function inputBorder(value: string, focused: boolean) {
    if (focused || value) return "border-blue-500";
    return "border-gray-400";
  }

  function inputColor(value: string, focused: boolean) {
    if (focused || value) return "text-blue-500";
    return "text-gray-500";
  }

  const showShadow = isFocused || email;

  return (
    <main className="flex justify-center items-center h-screen bg-linear-to-r from-blue-50 to-blue-100 p-4">
      <div className={`bg-gray-100 border border-blue-300 rounded-xl w-full max-w-md p-7 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500 ${showShadow ? "shadow-[0_0_12px_#3b82f6]" : "shadow-xl shadow-blue-500/10"}`}>
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center ring-4 ring-blue-50/50">
            <Mail className="text-blue-600" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
          <p className="text-gray-500 text-sm mt-1">
            Please enter your email and we will send you a link to reset your password.
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className={`w-full bg-gray-50 border rounded-xl px-5 py-2 pl-12 focus:outline-none transition-all ${inputBorder(email, isFocused)}`}
                  placeholder="Email"
                />
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${inputColor(email, isFocused)}`} size={20} />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Processing...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-6 animate-in zoom-in duration-300">
            <div className="bg-green-50 text-green-600 p-4 rounded-2xl flex items-start gap-3 text-left">
              <CheckCircle className="flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm font-medium leading-relaxed">
                We have sent the instructions to <span className="font-bold underline">{email}</span>. Please check your Inbox or Spam folder.
              </p>
            </div>
            <button
              onClick={() => setSubmitted(false)}
              className="text-blue-600 font-bold hover:underline transition-all"
            >
              Try another email?
            </button>
          </div>
        )}

        <div className="pt-4 border-t border-gray-100 flex justify-center">
            <Link 
              href="/login" 
              className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold text-sm transition-colors"
            >
              <ArrowLeft size={16} /> Back to Login
            </Link>
        </div>
      </div>
    </main>
  );
}
