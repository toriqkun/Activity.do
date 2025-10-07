"use client";
// import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
// import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function Home() {
  // const router = useRouter();

  // useEffect(() => {
  //   if (localStorage.getItem("token")) {
  //     router.push("/dashboard");
  //   } else {
  //     router.push("/login");
  //   }
  // }, [router]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-23 h-16 shadow-lg">
        {/* Logo */}
        <Link href="/home" className="flex items-center space-x-2">
          <Image src="/logo.webp" alt="Logo" width={150} height={80} />
        </Link>

        <div className="flex">
          <Link href="/home" className="px-7 font-medium text-gray-500 hover:text-blue-500">Home</Link>
          <Link href="/about" className="px-7 font-medium text-gray-500 hover:text-blue-500">About Us</Link>
          <Link href="/contact" className="px-7 font-medium text-gray-500 hover:text-blue-500">Contact Us</Link>
          <Link href="/faqs" className="px-7 font-medium text-gray-500 hover:text-blue-500">FAQs</Link>
        </div>

        {/* Actions */}
        <div className="flex h-full items-center space-x-2">
          <a href="/login" className="flex items-center h-full px-4 text-xl font-medium text-gray-700">
            Sign in
          </a>
          <a href="/register" className="flex items-center h-full px-4 text-xl font-medium text-white bg-blue-700 hover:bg-blue-800">
            Sign up
          </a>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="flex flex-1 items-center gap-5">
        {/* Left content */}
        <div className="space-y-6 w-full items-center px-20">
          <h1 className="text-5xl font-bold leading-tight mb-10">
            Capture, organize, and <br />
            tackle your to-dos from <br />
            anywhere.
          </h1>
          <p className="text-xl text-gray-600">Make it easier for yourself from clutter and chaos—unleash your productivity with Activity.do</p>

          <div className="flex">
            <a href="/login" className="w-50 flex justify-center items-center gap-2 py-3 text-white text-xl font-medium bg-blue-600 rounded-md hover:bg-blue-700">
              Get Started <ArrowRight className="mt-[2px]" size={20}/>
            </a>
          </div>
        </div>

        {/* Right image */}
        <div className="flex justify-center items-center">
          <img src="/konten.jpg" alt="App preview" className="w-full px-17" />
        </div>
      </main>
    </div>
  );
}
