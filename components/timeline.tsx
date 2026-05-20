"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

const timelineData = {
  "Day 01 - Open": [
    { icon: "/assets/020-svg-54-3868.svg", text: "Ecosystem talks & Keynotes" },
    { icon: "/assets/021-svg-54-3872.svg", text: "Team from our confirm stack" },
    { icon: "/assets/022-svg-54-3876.svg", text: "Sponsor Meet, their builder teams" },
    { icon: "/assets/023-svg-54-3880.svg", text: "Build sprint begins at sunset" },
  ],
  "Day 02 - Deep build": [
    { icon: "/assets/024-svg-54-3885.svg", text: "Morning: 24 hour product review" },
    { icon: "/assets/025-svg-54-3889.svg", text: "Sponsor mentor Office hours" },
    { icon: "/assets/026-svg-54-3893.svg", text: "Afternoon: intensive build block" },
    { icon: "/assets/027-svg-54-3897.svg", text: "Evening: workshop by track" },
  ],
  "Day 03 - Scale": [
    { icon: "/assets/028-svg-54-3902.svg", text: "Product demo checkpoints" },
    { icon: "/assets/029-svg-54-3906.svg", text: "Creator content shoot for HON" },
    { icon: "/assets/030-svg-54-3910.svg", text: "VC Feeds sessions" },
    { icon: "/assets/031-svg-54-3914.svg", text: "launch prep begins" },
  ],
  "Day 04 - Demo day": [
    { icon: "/assets/032-svg-54-3919.svg", text: "Final presentations" },
    { icon: "/assets/033-svg-54-3923.svg", text: "Judge evaluations" },
    { icon: "/assets/034-svg-54-3927.svg", text: "Prize ceremony" },
    { icon: "/assets/035-svg-54-3931.svg", text: "Networking & celebration" },
  ],
};

const dayColors = {
  "Day 01 - Open": "bg-brand-accent text-black font-bold",
  "Day 02 - Deep build": "bg-black text-brand-accent border-2 border-brand-accent",
  "Day 03 - Scale": "bg-black text-brand-accent border-2 border-brand-accent",
  "Day 04 - Demo day": "bg-brand-pink text-white font-bold",
};

export function Timeline() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative bg-black py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-12">
          <Image
            src="/assets/036-vector-54-3934.svg"
            alt=""
            width={50}
            height={50}
            className="w-10 h-10"
          />
          <h2 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-brand-accent">
            Tracks & Schedule
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Object.entries(timelineData).map(([day, items], dayIndex) => (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 60 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.8,
                delay: dayIndex * 0.15,
                ease: "easeOut",
              }}
              className="space-y-6"
            >
              <div className={`px-6 py-3 font-mono text-sm uppercase tracking-wider w-fit ${dayColors[day as keyof typeof dayColors]}`}>
                {day}
              </div>

              <div className="space-y-4 pl-4">
                {items.map((item, itemIndex) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, x: -30 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{
                      duration: 0.5,
                      delay: dayIndex * 0.15 + itemIndex * 0.1 + 0.3,
                      ease: "easeOut",
                    }}
                    whileHover={{ x: 8 }}
                    className="flex items-center gap-4 group cursor-pointer"
                  >
                    <div className="w-8 h-8 flex items-center justify-center">
                      <Image
                        src={item.icon}
                        alt=""
                        width={24}
                        height={24}
                        className="w-6 h-6"
                      />
                    </div>
                    <span className="font-mono text-sm text-white group-hover:text-brand-accent transition-colors font-bold">
                      {item.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}