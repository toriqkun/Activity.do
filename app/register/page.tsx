"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Mail, Lock, User } from "lucide-react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [errors, setErrors] = useState<{ email?: string; username?: string; password?: string; fullname?: string }>({});
  const [submitError, setSubmitError] = useState("");
  const [focused, setFocused] = useState<{ email: boolean; password: boolean; username: boolean; fullname: boolean }>({
    email: false,
    password: false,
    username: false,
    fullname: false,
  });
  const router = useRouter();

  function isEmailValid(value: string) {
    return /\S+@\S+\.\S+/.test(value);
  }
  function isPasswordValid(value: string) {
    return value.length >= 8;
  }
  function isUsernameValid(value: string) {
    return value.length >= 4;
  }
  function isFullnameValid(value: string) {
    return value.length >= 4 && value.length <= 20;
  }

  useEffect(() => {
    const newErrors: typeof errors = {};
    if (email && !isEmailValid(email)) newErrors.email = "Invalid email";
    if (username && !isUsernameValid(username)) newErrors.username = "Username minimum 4 characters";
    if (fullname && !isFullnameValid(fullname)) newErrors.fullname = "Fullname minimum 4-20 characters";
    if (password && !isPasswordValid(password)) newErrors.password = "Password minimum 8 characters";
    setErrors(newErrors);
  }, [email, username, password, fullname]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!fullname || !username || !email || !password) {
      setSubmitError("Please fill in all fields");
      return;
    }

    if (Object.keys(errors).length > 0) {
      setSubmitError("Please fix the errors before submitting.");
      return;
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullname,
          photo_profile: "",
        },
      },
    });

    if (authError || !authData.user) {
      setSubmitError(authError?.message || "Failed to register");
      return;
    }

    toast.success("Successfully registered");
    router.push("/login");
  }

  function inputBorder(type: "email" | "password" | "username" | "fullname", value: string, focused: boolean) {
    if (focused && !value) return "border-blue-500";
    if (value) {
      if (type === "email" && !isEmailValid(value)) return "border-red-500";
      if (type === "password" && !isPasswordValid(value)) return "border-red-500";
      if (type === "username" && !isUsernameValid(value)) return "border-red-500";
      if (type === "fullname" && !isFullnameValid(value)) return "border-red-500";
      return "border-blue-500";
    }
    return "border-gray-400";
  }

  function inputColor(type: "email" | "password" | "username" | "fullname", value: string, focused: boolean) {
    if (focused && !value) return "text-blue-500";
    if (value) {
      if (type === "email" && !isEmailValid(value)) return "text-red-500";
      if (type === "password" && !isPasswordValid(value)) return "text-red-500";
      if (type === "username" && !isUsernameValid(value)) return "text-red-500";
      if (type === "fullname" && !isFullnameValid(value)) return "text-red-500";
      return "text-blue-500";
    }
    return "text-gray-500";
  }

  const showShadow = focused.email || focused.password || focused.username || focused.fullname || email || password || username || fullname;

  return (
    <main className="flex justify-center items-center h-screen bg-linear-to-r/hsl from-blue-50 to-blue-100">
      <form onSubmit={handleRegister} className={`bg-gray-100 border-1 border-blue-300 rounded w-96 p-7 transition-all ${showShadow ? "shadow-[0_0_15px_#3b82f6]" : ""}`}>
        <img src="/logo.webp" alt="" className="w-38 mx-auto mb-3" />
        <h1 className="text-[19px] mb-6 flex justify-center font-semibold text-gray-700">Sign up to continue</h1>
        {/* Fullname */}
        <div className="mb-6 relative">
          <User className={`absolute right-3 top-1/2 -translate-y-1/2 ${inputColor("fullname", fullname, focused.fullname)}`} size={18} />
          <input
            className={`text-gray-700 rounded-[5px] border p-2 w-full focus:outline-none ${inputBorder("fullname", fullname, focused.fullname)}`}
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            onFocus={() => setFocused((prev) => ({ ...prev, fullname: true }))}
            onBlur={() => setFocused((prev) => ({ ...prev, fullname: false }))}
            placeholder="Fullname"
          />
          {errors.fullname && <p className="absolute top-[42px] left-1 text-red-500 text-xs">{errors.fullname}</p>}
        </div>
        {/* Username */}
        <div className="mb-6 relative">
          <User className={`absolute right-3 top-1/2 -translate-y-1/2 ${inputColor("username", username, focused.username)}`} size={18} />
          <input
            className={`text-gray-700 rounded-[5px] border p-2 w-full focus:outline-none ${inputBorder("username", username, focused.username)}`}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onFocus={() => setFocused((prev) => ({ ...prev, username: true }))}
            onBlur={() => setFocused((prev) => ({ ...prev, username: false }))}
            placeholder="Username"
          />
          {errors.username && <p className="absolute top-[42px] left-1 text-red-500 text-xs">{errors.username}</p>}
        </div>
        {/* Email */}
        <div className="mb-6 relative">
          <Mail className={`absolute right-3 top-1/2 -translate-y-1/2 ${inputColor("email", email, focused.email)}`} size={18} />
          <input
            className={`text-gray-700 rounded-[5px] border p-2 pr-9 w-full focus:outline-none ${inputBorder("email", email, focused.email)}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocused((prev) => ({ ...prev, email: true }))}
            onBlur={() => setFocused((prev) => ({ ...prev, email: false }))}
            placeholder="Email"
          />
          {errors.email && <p className="absolute top-[42px] left-1 text-red-500 text-xs">{errors.email}</p>}
        </div>
        {/* Password */}
        <div className="mb-3 relative">
          <Lock className={`absolute right-3 top-1/2 -translate-y-1/2 ${inputColor("password", password, focused.password)}`} size={18} />
          <input
            type="password"
            className={`text-gray-700 rounded-[5px] border p-2 pr-9 w-full focus:outline-none ${inputBorder("password", password, focused.password)}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocused((prev) => ({ ...prev, password: true }))}
            onBlur={() => setFocused((prev) => ({ ...prev, password: false }))}
            placeholder="Password"
          />
          {/* Error Validation Password */}
          {errors.password && <p className="absolute top-[42px] left-1 text-red-500 text-xs">{errors.password}</p>}
        </div>
        {/* Submit error */}
        <div className="relative">
          {/* Submit error */}
          {submitError && (
            <p title="Please enter a valid email to confirm your account." className="absolute top-[-1px] left-1 text-red-500 text-xs">
              {submitError} <span className="text-[17px]">ⓘ</span>
            </p>
          )}
        </div>
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white mt-5 px-4 py-2 rounded-full w-full cursor-pointer">
          Sign up
        </button>
        <p className="mt-3 text-sm text-center text-gray-400">
          Already have an account?
          <a href="/login" className="text-blue-500 hover:underline">
            Sign in
          </a>
        </p>
      </form>
    </main>
  );
}
