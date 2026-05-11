"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Image from "next/image";

const scheduleData = {
  "Day 1": [
    { time: "10:00 AM", activity: "Check-in & Registration" },
    { time: "12:00 PM", activity: "Opening Ceremony & Keynote" },
    { time: "02:00 PM", activity: "Team Formation Session" },
    { time: "04:00 PM", activity: "Hacking Begins - Track Selection" },
    { time: "08:00 PM", activity: "Welcome Dinner & Networking" },
  ],
  "Day 2": [
    { time: "09:00 AM", activity: "Morning: 24-hour Product Review" },
    { time: "11:00 AM", activity: "Sponsor Mentor Office Hours" },
    { time: "02:00 PM", activity: "Afternoon: Intensive Build Block" },
    { time: "06:00 PM", activity: "Workshop by Track" },
    { time: "09:00 PM", activity: "Night Hacking Session" },
  ],
  "Day 3": [
    { time: "09:00 AM", activity: "Product Demo Checkpoints" },
    { time: "12:00 PM", activity: "Creator Content Shoot" },
    { time: "03:00 PM", activity: "VC Fireside Chats" },
    { time: "06:00 PM", activity: "Launch Prep Begins" },
    { time: "10:00 PM", activity: "Final Push" },
  ],
  "Day 4": [
    { time: "09:00 AM", activity: "Final Project Submissions" },
    { time: "11:00 AM", activity: "Project Demos Begin" },
    { time: "02:00 PM", activity: "Final Presentations" },
    { time: "04:00 PM", activity: "Prize Ceremony & Closing" },
    { time: "06:00 PM", activity: "Celebration & Networking" },
  ],
};

const days = ["Day 1", "Day 2", "Day 3", "Day 4"];

export function Agenda() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeDay, setActiveDay] = useState("Day 1");

  return (
    <section id="agenda" ref={ref} className="relative bg-brand-primary py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <Image
          src="/assets/178-objects-54-30001.svg"
          alt=""
          fill
          className="object-cover"
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-16 text-center"
        >
          <h2 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-white mb-4">
            Agenda
          </h2>
          <p className="font-mono text-sm text-brand-accent uppercase tracking-wider font-bold">
            4 days of building, learning, and connecting
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {days.map((day) => (
            <motion.button
              key={day}
              onClick={() => setActiveDay(day)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-8 py-3 font-mono text-sm uppercase tracking-wider transition-all duration-300 font-bold ${
                activeDay === day
                  ? "bg-brand-accent text-black shadow-[4px_4px_0_#ff1493]"
                  : "bg-black text-brand-accent border-2 border-brand-accent hover:bg-brand-accent/20"
              }`}
            >
              {day}
            </motion.button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeDay}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {scheduleData[activeDay as keyof typeof scheduleData]?.map((item, index) => (
              <motion.div
                key={item.activity}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ x: 8 }}
                className="bg-black border-2 border-brand-accent p-6 flex items-center gap-6 hover:shadow-[6px_6px_0_#ffd700] transition-all cursor-pointer"
              >
                <span className="font-mono text-sm font-bold text-brand-pink min-w-[100px]">
                  {item.time}
                </span>
                <span className="font-mono text-base text-white font-bold">
                  {item.activity}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
