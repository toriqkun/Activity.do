"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, Loader2, CheckCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focused, setFocused] = useState<{ password: boolean; confirm: boolean }>({ password: false, confirm: false });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      if (res.ok) {
        setSuccess(true);
        toast.success("Password updated successfully!");
        setTimeout(() => router.push("/login"), 3000);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to reset password.");
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

  const showShadow = focused.password || focused.confirm || password || confirmPassword;

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold text-red-600">Invalid token</h2>
        <p className="text-gray-500">Please request a new reset link.</p>
        <Link href="/forgot-password" className="text-blue-600 font-bold hover:underline">
          Forgot Password
        </Link>
      </div>
    );
  }

  return (
    <div className={`bg-gray-100 border border-blue-300 rounded-xl w-full max-w-md p-8 sm:p-10 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500 ${showShadow ? "shadow-[0_0_12px_#3b82f6]" : "shadow-xl shadow-blue-500/10"}`}>
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 ring-4 ring-blue-50/50">
          <ShieldCheck className="text-blue-600" size={40} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Set New Password</h1>
        <p className="text-gray-500 text-sm mt-1">
          Enter your new password below to secure your account.
        </p>
      </div>

      {!success ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">New Password</label>
            <div className="relative group">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused((prev) => ({ ...prev, password: true }))}
                onBlur={() => setFocused((prev) => ({ ...prev, password: false }))}
                className={`w-full bg-gray-50 border rounded-xl px-5 py-2 pl-12 focus:outline-none transition-all ${inputBorder(password, focused.password)}`}
                placeholder="Password"
              />
              <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${inputColor(password, focused.password)}`} size={20} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Confirm Password</label>
            <div className="relative group">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setFocused((prev) => ({ ...prev, confirm: true }))}
                onBlur={() => setFocused((prev) => ({ ...prev, confirm: false }))}
                className={`w-full bg-gray-50 border rounded-xl px-5 py-2 pl-12 focus:outline-none transition-all ${inputBorder(confirmPassword, focused.confirm)}`}
                placeholder="Confirm Password"
              />
              <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${inputColor(confirmPassword, focused.confirm)}`} size={20} />
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Updating...
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </form>
      ) : (
        <div className="text-center space-y-6 animate-in zoom-in duration-300">
          <div className="bg-green-50 text-green-600 p-6 rounded-3xl flex flex-col items-center gap-4">
            <CheckCircle className="text-green-500" size={48} />
            <div className="space-y-1">
                <p className="font-bold text-lg">Password Updated!</p>
                <p className="text-sm">You will be redirected to the login page in a few seconds.</p>
            </div>
          </div>
          <Link href="/login" className="block w-full text-blue-600 font-bold hover:underline">
            Click here if not redirected automatically
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex justify-center items-center h-screen bg-linear-to-r from-blue-50 to-blue-100 p-4">
      <Suspense fallback={<Loader2 className="animate-spin text-blue-600" size={40} />}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
