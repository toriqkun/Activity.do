"use client";
import { motion } from "framer-motion";
import { PenLine, Upload, Users, Rocket } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="relative h-screen text-white overflow-hidden">

      {/* Overlay Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-20 md:py-35">
        {/* Title */}
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-4xl md:text-5xl font-extrabold text-blue-600 mb-7">
          Welcome to Activity.do
        </motion.h1>

        {/* Subtitle */}
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="max-w-3xl text-gray-700 text-lg md:text-xl mb-12">
          Stay organized, collaborate effortlessly, and reach your goals faster.
          <span className="font-semibold text-blue-600"> Activity.do</span> helps you plan smarter and work together effectively — all in one place.
        </motion.p>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mb-12">
          {[
            {
              icon: <PenLine size={31} className="text-blue-600" />,
              title: "Create Tasks",
              desc: "Write down what matters and organize your to-do list easily.",
            },
            {
              icon: <Upload size={31} className="text-blue-600" />,
              title: "Attach Files",
              desc: "Add documents or references directly to your projects.",
            },
            {
              icon: <Users size={31} className="text-blue-600" />,
              title: "Team Collaboration",
              desc: "Invite teammates, assign tasks, and track progress together.",
            },
            {
              icon: <Rocket size={31} className="text-blue-600" />,
              title: "Track Progress",
              desc: "Monitor productivity and reach milestones efficiently.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * i }}
              className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-blue-300 hover:bg-white/20 transition"
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 bg-white/10 rounded-full">{item.icon}</div>
                <h3 className="text-gray-800 text-lg font-semibold">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8, duration: 0.6 }}>
          <Link href="/activitydo/todo-app" className="bg-blue-600 text-gray-900 font-semibold px-8 py-3 rounded-full text-lg hover:bg-blue-700 transition">
            Get Started
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
