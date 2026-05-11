"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

const speakerPhotos = [
  { frame: "/assets/037-frame-1948754909-54-3938.svg", mask: "/assets/038-frame-1948754910-54-4316.svg" },
  { frame: "/assets/039-frame-1948754909-54-4700.svg", mask: "/assets/040-frame-1948754910-54-5078.svg" },
  { frame: "/assets/041-frame-1948754909-54-5462.svg", mask: "/assets/042-frame-1948754910-54-5840.svg" },
  { frame: "/assets/043-frame-1948754909-54-6224.svg", mask: "/assets/044-frame-1948754910-54-6602.svg" },
  { frame: "/assets/045-frame-1948754909-54-6986.svg", mask: "/assets/046-frame-1948754910-54-7364.svg" },
  { frame: "/assets/047-frame-1948754909-54-7748.svg", mask: "/assets/048-frame-1948754910-54-8126.svg" },
  { frame: "/assets/085-frame-1948754909-54-17608.svg", mask: "/assets/086-frame-1948754910-54-17986.svg" },
  { frame: "/assets/087-frame-1948754909-54-18370.svg", mask: "/assets/088-frame-1948754910-54-18748.svg" },
  { frame: "/assets/089-frame-1948754909-54-19132.svg", mask: "/assets/090-frame-1948754910-54-19510.svg" },
  { frame: "/assets/091-frame-1948754909-54-19894.svg", mask: "/assets/092-frame-1948754910-54-20272.svg" },
  { frame: "/assets/093-frame-1948754909-54-20656.svg", mask: "/assets/094-frame-1948754910-54-21034.svg" },
  { frame: "/assets/095-frame-1948754909-54-21418.svg", mask: "/assets/096-frame-1948754910-54-21796.svg" },
  { frame: "/assets/097-frame-1948754909-54-22181.svg", mask: "/assets/098-frame-1948754910-54-22559.svg" },
  { frame: "/assets/099-frame-1948754909-54-22943.svg", mask: "/assets/100-frame-1948754910-54-23321.svg" },
  { frame: "/assets/101-frame-1948754909-54-23705.svg", mask: "/assets/102-frame-1948754910-54-24083.svg" },
  { frame: "/assets/103-frame-1948754909-54-24467.svg", mask: "/assets/104-frame-1948754910-54-24845.svg" },
];

const speakerNames = [
  "Prayashu", "Prashant", "Anirudh", "Amit", "Sarah", "Raj", "Priya", "Vikram",
  "Neha", "Karan", "Fatima", "Arjun", "Meera", "Ravi", "Anita", "Sanjay"
];

export function Speakers() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative bg-brand-pink py-20 md:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-16"
        >
          <h2 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-white mb-4">
            Speakers & Mentors
          </h2>
          <p className="font-mono text-sm text-white/70 uppercase tracking-wider font-bold">
            Meet the visionaries behind Hacker House Goa
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {speakerPhotos.map((photo, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{
                duration: 0.6,
                delay: index * 0.08,
                ease: "easeOut",
              }}
              whileHover={{ scale: 1.05, y: -8 }}
              className="group cursor-pointer"
            >
              <div className="bg-black p-4 border-2 border-brand-accent transition-all duration-300 group-hover:shadow-[8px_8px_0_#ffd700]">
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={photo.frame}
                    alt={`Speaker photo ${index + 1}`}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-4 text-center">
                  <p className="font-heading font-bold text-lg text-white">
                    {speakerNames[index] || `Speaker ${index + 1}`}
                  </p>
                  <p className="font-mono text-xs text-brand-accent mt-1 font-bold">
                    @hackerhouse
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="font-mono text-sm text-white/60 uppercase tracking-wider mb-4 font-bold">
            And many more industry experts...
          </p>
          <motion.a
            href="#cta"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 bg-brand-accent text-black px-8 py-4 font-mono font-bold text-sm uppercase tracking-wider shadow-[4px_4px_0_#1a4d2e] hover:shadow-[6px_6px_0_#1a4d2e] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
          >
            View All Speakers
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}