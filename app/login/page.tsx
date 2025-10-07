"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [focused, setFocused] = useState<{ email: boolean; password: boolean }>({ email: false, password: false });
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      setError("Incorrect email or password");
      return;
    }

    localStorage.setItem("user_id", data.user.id);
    localStorage.setItem("just_logged_in", "true");
    router.push("/dashboard");
  }

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

  const showShadow = focused.email || focused.password || email || password;

  return (
    <main className="flex justify-center items-center h-screen bg-linear-to-r/hsl from-blue-50 to-blue-100">
      <form onSubmit={handleLogin} className={`bg-gray-100 border-1 border-blue-300 rounded w-96 p-7 transition-all ${showShadow ? "shadow-[0_0_4px_#3b82f6]" : ""}`}>
        <img src="/logo.webp" alt="" className="w-38 mx-auto mb-3" />
        <p className="text-[19px] mb-6 flex justify-center font-semibold text-gray-700">Sign in to continue</p>
        <div className="mb-5 relative">
          <Mail className={`absolute right-3 top-1/2 -translate-y-1/2 ${inputColor(email, focused.email)}`} size={18} />
          <input
            className={`text-gray-700 rounded-[5px] border p-2 pr-9 w-full focus:outline-none ${inputBorder(email, focused.email)}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocused((prev) => ({ ...prev, email: true }))}
            onBlur={() => setFocused((prev) => ({ ...prev, email: false }))}
            placeholder="Email"
          />
        </div>
        <div className="mb-3 relative">
          <Lock className={`absolute right-3 top-1/2 -translate-y-1/2 ${inputColor(password, focused.password)}`} size={18} />
          <input
            className={`text-gray-700 rounded-[5px] border p-2 pr-9 w-full focus:outline-none ${inputBorder(password, focused.password)}`}
            value={password}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocused((prev) => ({ ...prev, password: true }))}
            onBlur={() => setFocused((prev) => ({ ...prev, password: false }))}
            placeholder="Password"
          />
        </div>
        <div className="relative">{error && <p className="absolute top-[-8px] left-1 text-red-500 text-sm">{error}</p>}</div>
        <div className="w-full text-end mt-1">
          <a href="/forgot-password" className="text-gray-400 text-sm hover:text-blue-500">
            Forgot password?
          </a>
        </div>
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 mt-[3px] py-2 rounded-full w-full cursor-pointer">
          Sign in
        </button>
        <p className="mt-3 text-sm text-center text-gray-400">
          Don’t have an account yet?{" "}
          <a href="/register" className="text-blue-500 hover:underline">
            Sign up
          </a>
        </p>
      </form>
    </main>
  );
}
