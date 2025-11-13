"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Users, Bell, CheckCircle2, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-8 md:px-16 h-16 shadow-sm backdrop-blur-md bg-white/80 sticky top-0 z-50">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/logo.webp" alt="Activity.do Logo" width={150} height={80} />
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-gray-700 hover:text-blue-700 font-medium px-3 py-2 text-lg">
            Sign in
          </Link>
          <Link href="/register" className="bg-blue-700 hover:bg-blue-800 text-white font-medium px-4 py-2 rounded-md text-lg">
            Sign up
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="flex flex-col flex-1 items-center justify-center text-center px-8 md:px-32 py-28 bg-gradient-to-b from-blue-50 via-indigo-100 to-purple-50 relative overflow-hidden">
        {/* Subtle gradient overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-200/20 via-purple-200/20 to-transparent blur-3xl" />

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut" }} className="relative max-w-3xl space-y-8 z-10">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="text-5xl md:text-6xl font-extrabold leading-tight text-gray-900"
          >
            Plan smarter. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600">Work together.</span> <br />
            Achieve more.
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 1 }} className="text-lg md:text-xl text-gray-600 leading-relaxed">
            Stay organized and connected — manage your daily activities, projects, and collaborations effortlessly with <span className="font-semibold text-blue-700">Activity.do</span>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
          >
            <Link
              href="/register"
              className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-3 rounded-lg text-lg transition-all shadow-md hover:shadow-xl"
            >
              Get Started <ArrowRight size={20} />
            </Link>
          </motion.div>
        </motion.div>
      </main>

      {/* FEATURES SECTION */}
      <section className="bg-gray-50 py-20 px-8 md:px-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">Everything you need to stay productive</h2>

        <div className="grid md:grid-cols-3 gap-10">
          <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition">
            <CheckCircle2 className="text-blue-700 mb-4" size={40} />
            <h3 className="text-xl font-semibold mb-2">Task Management</h3>
            <p className="text-gray-600">Create, organize, and track your daily activities effortlessly.</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition">
            <Users className="text-blue-700 mb-4" size={40} />
            <h3 className="text-xl font-semibold mb-2">Collaboration</h3>
            <p className="text-gray-600">Work with your team in real-time, assign tasks, and share progress.</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition">
            <Bell className="text-blue-700 mb-4" size={40} />
            <h3 className="text-xl font-semibold mb-2">Smart Notifications</h3>
            <p className="text-gray-600">Get instant updates and reminders — stay in sync from anywhere.</p>
          </motion.div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 bg-blue-700 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-blue-400/20 to-transparent blur-3xl" />
        <Sparkles size={40} className="mx-auto mb-4 relative z-10" />
        <h2 className="text-4xl font-bold mb-4 relative z-10">Boost your productivity today</h2>
        <p className="text-lg mb-8 text-blue-100 relative z-10">Join thousands of users managing their activities smarter with Activity.do.</p>
        <Link href="/register" className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-all text-lg relative z-10">
          Get Started for Free
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 text-center py-8 text-sm">
        <p>
          © {new Date().getFullYear()} <span className="text-white font-semibold">Activity.do</span> — All rights reserved.
        </p>
      </footer>
    </div>
  );
}
