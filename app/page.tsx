"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Users, Bell, CheckCircle2, Sparkles, Zap, Shield, Layout } from "lucide-react";
import { useRef } from "react";

export default function Home() {
  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);

  return (
    <div ref={scrollRef} className="min-h-screen flex flex-col bg-[#FDFDFF] text-gray-900 font-sans overflow-hidden">
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-6 md:px-16 h-20 bg-white/70 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-[100]">
        <Link href="/" className="flex items-center group transition-transform hover:scale-105">
          <Image src="/logo.webp" alt="Activity.do Logo" width={160} height={40} className="w-auto h-10" />
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-gray-600 hover:text-gray-900 font-bold px-4 py-2 text-md">
            Sign in
          </Link>
          <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-2xl text-md shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 active:translate-y-0">
            Get Started
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="relative flex flex-col items-center justify-center text-center px-6 md:px-32 pt-20 pb-40 overflow-hidden bg-white">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <motion.div style={{ y: y1 }} className="absolute -top-20 -left-10 w-80 h-80 bg-blue-100/50 rounded-full blur-[100px]" />
          <motion.div style={{ y: y2 }} className="absolute top-40 -right-20 w-96 h-96 bg-indigo-100/50 rounded-full blur-[120px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-4xl space-y-10 z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full mb-4">
            <Sparkles className="text-blue-600" size={16} />
            <span className="text-blue-700 text-xs font-bold uppercase tracking-widest">New: Collaborative Workspaces</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black leading-none tracking-tight text-gray-900 selection:bg-blue-100">
            Work Better, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Together.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-xl md:text-2xl text-gray-500 leading-relaxed font-medium">
            The ultimate collaborative task manager designed for teams who value efficiency and speed. Plan, track, and achieve your goals in real-time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
            <Link
              href="/register"
              className="group relative flex items-center justify-center gap-3 bg-blue-600 text-white font-bold px-10 py-5 rounded-[2rem] text-lg transition-all hover:bg-blue-700 hover:shadow-2xl hover:shadow-gray-300 active:scale-95"
            >
              Start Building Now
              <div className="bg-white/20 p-1 rounded-full group-hover:translate-x-1 transition-transform">
                <ArrowRight size={20} />
              </div>
            </Link>
          </div>
        </motion.div>
      </main>

      {/* DASHBOARD PREVIEW */}
      <div className="relative -mt-32 px-6 md:px-0 flex justify-center z-20">
        <motion.div 
           initial={{ opacity: 0, scale: 0.9, y: 50 }}
           whileInView={{ opacity: 1, scale: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 1, delay: 0.2 }}
           className="relative max-w-5xl w-full bg-white rounded-t-[3rem] p-4 shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.1)] border-x border-t border-gray-100"
        >
          <div className="bg-gray-50 rounded-[2rem] overflow-hidden aspect-[16/9] relative border border-gray-100 group">
             <Image 
               src="/1.jpg" 
               alt="Dashboard Preview" 
               fill
               className="object-cover object-top transition-transform duration-700 group-hover:scale-105" 
             />
             <div className="absolute inset-0 bg-gradient-to-t from-gray-900/10 to-transparent pointer-events-none" />
          </div>
        </motion.div>
      </div>

      {/* FEATURES SECTION */}
      <section id="features" className="bg-white py-20 px-6 md:px-20 text-center overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-24"
          >
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Built for modern workflows.</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">Everything you need to ship products and manage teams in one cohesive platform.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Zap className="text-blue-600" />, title: "Real-time Sync", desc: "Experience lightning-fast updates across all devices instantly with WebSocket technology.", color: "bg-blue-100" },
              { icon: <Users className="text-indigo-600" />, title: "Team Collab", desc: "Invite collaborators, discuss tasks with comments, and share the workload seamlessly.", color: "bg-indigo-100" },
              { icon: <Bell className="text-purple-600" />, title: "Intelligent Alerts", desc: "Stay on top of what matters with smart notifications tailored to your workflow.", color: "bg-purple-100" }
            ].map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className="group relative flex flex-col items-start text-left p-10 bg-[#FDFDFF] border border-gray-300 rounded-2xl transition-all hover:bg-white hover:shadow-2xl hover:shadow-gray-200/50"
              >
                <div className={`p-4 ${f.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-2xl font-black mb-4">{f.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="px-6 py-10 pb-15">
         <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative max-w-7xl mx-auto bg-blue-600 rounded-[3rem] p-12 md:p-24 overflow-hidden text-center text-white shadow-3xl shadow-blue-500/20"
         >
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full -mr-40 -mt-20" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400/20 blur-[80px] rounded-full -ml-40 -mb-20" />
            
            <div className="relative z-10 space-y-8">
              <Sparkles size={64} className="mx-auto mb-8 text-blue-200/50" />
              <h2 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">Ready to boost <br /> your productivity?</h2>
              <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto font-medium">Join us to manage your daily activities smarter using Activity.do.</p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-6 pt-8">
                <Link href="/register" className="bg-white text-blue-700 font-black px-12 py-5 rounded-[2rem] text-xl shadow-xl hover:bg-blue-50 transition-all hover:scale-105 active:scale-95">
                  Get Started for Free
                </Link>
                <Link href="/login" className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-12 py-5 rounded-[2rem] text-xl transition-all border border-blue-400">
                  Speak to Sales
                </Link>
              </div>
            </div>
         </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-100 pt-10 pb-6 px-6 md:px-16">
        <div className="max-w-7xl mx-auto pt-8 border-t border-gray-50 flex md:flex-row justify-center items-center gap-6">
           <p className="text-gray-500 text-md font-medium">© {new Date().getFullYear()}Activity.do — Crafting better tools for teams.</p>
        </div>
      </footer>
    </div>
  );
}
