"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Lock } from "lucide-react";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<{ password: boolean; confirm: boolean }>({
    password: false,
    confirm: false,
  });

  function isPasswordValid(value: string) {
    return value.length >= 8;
  }
  function isConfirmValid(pass: string, conf: string) {
    return pass === conf;
  }

  useEffect(() => {
    const newErrors: typeof errors = {};
    if (password && !isPasswordValid(password)) newErrors.password = "Password minimum 8 characters";
    if (confirm && !isConfirmValid(password, confirm)) newErrors.confirm = "Passwords do not match";
    setErrors(newErrors);
  }, [password, confirm]);

  function inputBorder(type: "password" | "confirm", value: string, focused: boolean) {
    if (focused && !value) return "border-blue-500";
    if (value) {
      if (type === "password" && !isPasswordValid(value)) return "border-red-500";
      if (type === "confirm" && !isConfirmValid(password, confirm)) return "border-red-500";
      return "border-blue-500";
    }
    return "border-gray-400";
  }

  function inputColor(type: "password" | "confirm", value: string, focused: boolean) {
    if (focused && !value) return "text-blue-500";
    if (value) {
      if (type === "password" && !isPasswordValid(value)) return "text-red-500";
      if (type === "confirm" && !isConfirmValid(password, confirm)) return "text-red-500";
      return "text-blue-500";
    }
    return "text-gray-500";
  }

  const showShadow = focused.password || focused.confirm || password || confirm;

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    const { error: resetError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (resetError) {
      setSubmitError(`${resetError.message}`);
    } else {
      toast.success("Successfully reset password 🎉");
      router.push("/login");
    }
  }

  return (
    <main className="flex justify-center items-center h-screen bg-linear-to-r/hsl from-blue-50 to-blue-100">
      <form onSubmit={handleResetPassword} className={`bg-gray-100 border border-blue-300 rounded w-96 p-7 transition-all ${showShadow ? "shadow-[0_0_15px_#3b82f6]" : ""}`}>
        <img src="/logo.webp" alt="" className="w-38 mx-auto mb-2" />
        <p className="text-[18px] mb-6 flex justify-center font-semibold text-gray-700">Enter new password</p>
        {/* Password */}
        <div className="mb-6 relative">
          <Lock className={`absolute right-3 top-1/2 -translate-y-1/2 ${inputColor("password", password, focused.password)}`} size={18} />
          <input
            type="password"
            placeholder="Password baru"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocused((prev) => ({ ...prev, password: true }))}
            onBlur={() => setFocused((prev) => ({ ...prev, password: false }))}
            className={`text-gray-700 rounded-[5px] border p-2 pr-9 w-full focus:outline-none ${inputBorder("password", password, focused.password)}`}
          />
          {errors.password && <p className="absolute top-[42px] left-1 text-red-500 text-xs">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div className="mb-3 relative">
          <Lock className={`absolute right-3 top-1/2 -translate-y-1/2 ${inputColor("confirm", confirm, focused.confirm)}`} size={18} />
          <input
            type="password"
            placeholder="Konfirmasi password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onFocus={() => setFocused((prev) => ({ ...prev, confirm: true }))}
            onBlur={() => setFocused((prev) => ({ ...prev, confirm: false }))}
            className={`text-gray-700 rounded-[5px] border p-2 pr-9 w-full focus:outline-none ${inputBorder("confirm", confirm, focused.confirm)}`}
          />
          {/* Error Validation Confirm Pass */}
          {errors.confirm && <p className="absolute top-[42px] left-1 text-red-500 text-xs">{errors.confirm}</p>}
        </div>
        {/* Submit Error */}
        {submitError && <p className="text-red-500 text-center text-xs">{submitError}</p>}
        <button type="submit" disabled={loading} className="bg-blue-500 text-white px-4 py-2 mt-4 rounded-full w-full disabled:opacity-50">
          {loading ? "Menyimpan..." : "Reset Password"}
        </button>
      </form>
    </main>
  );
}
