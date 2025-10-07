"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Mail, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  // const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  function inputBorder(value: string, focused: boolean) {
    if (focused && !value) return "border-blue-500";
    if (value) return "border-blue-500";
    return "border-gray-400";
  }

  function inputColor(value: string, focused: boolean) {
    if (focused && !value) return "text-blue-500";
    if (value) return "text-blue-500";
    return "text-gray-500";
  }

  const showShadow = focused || email;

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // setError("");

    // const { data: userCheck, error: userError } = await supabase.from("auth.users").select("id").eq("email", email).single();

    // if (userError || !userCheck) {
    //   setError("User tidak ditemukan");
    //   setLoading(false);
    //   return;
    // }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError("Failed to send reset email: " + error.message);
    } else {
      setShowModal(true);
    }
  }

  return (
    <main className="flex justify-center items-center h-screen bg-linear-to-r/hsl from-blue-50 to-blue-100">
      <form onSubmit={handleForgotPassword} className={`bg-gray-100 border border-blue-300 rounded w-96 p-7 transition-all ${showShadow ? "shadow-[0_0_15px_#3b82f6]" : ""}`}>
        <img src="/logo.webp" alt="" className="w-38 mx-auto mb-3" />
        <p className="text-[16.5px] mb-5 flex justify-center font-semibold text-gray-700">Enter your email to get the reset code.</p>
        <div className="mb-3 relative">
          <Mail className={`absolute right-3 top-1/2 -translate-y-1/2 ${inputColor(email, focused)}`} size={18} />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`text-gray-700 rounded-[5px] border p-2 pr-9 w-full focus:outline-none ${inputBorder(email, focused)}`}
          />
        </div>
        <div className="relative">
          {error && <p className="absolute top-[-11px] left-1 text-[13.5px] text-red-500 mb-3">{error}</p>}
        </div>

        <button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 mt-[15px] rounded-full w-full disabled:opacity-50 cursor-pointer">
          {loading ? "Sending..." : "Send"}
        </button>
        <p className="mt-3 text-sm text-center text-gray-400">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 hover:underline">
            Sign in
          </a>
        </p>
      </form>

      {/* Modal sukses */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#1d1d1d] rounded-lg p-6 text-center w-110 shadow-lg">
            <CheckCircle className="text-green-500 w-20 h-20 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-white mb-10">Success!</h2>
            <p className="text-gray-300 text-md mb-5">A password reset link has been sent to your email.</p>
            <button onClick={() => setShowModal(false)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full w-full">
              Tutup
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
