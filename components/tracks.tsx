"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

const tracks = [
  {
    title: "Privacy",
    description: "Build solutions that protect user data and ensure privacy-first experiences.",
    image: "/assets/012-frame-1948754900-54-813.svg",
  },
  {
    title: "Web3",
    description: "Create innovative applications leveraging blockchain technology and decentralized systems.",
    image: "/assets/014-frame-1948754900-54-1572.svg",
  },
  {
    title: "Security",
    description: "Develop secure systems and applications that protect against cyber threats.",
    image: "/assets/016-frame-1948754900-54-2331.svg",
  },
  {
    title: "Full Stack",
    description: "Build full-stack applications with modern frameworks and cloud-native architectures.",
    image: "/assets/018-frame-1948754900-54-3090.svg",
  },
];

export function Tracks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="tracks" ref={ref} className="relative bg-black py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-16"
        >
          <h2 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-brand-accent mb-4">
            Tracks
          </h2>
          <p className="font-mono text-sm text-white/70 uppercase tracking-wider max-w-xl font-bold">
            Choose your challenge from our specialized tracks designed for innovation
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {tracks.map((track, index) => (
            <motion.div
              key={track.title + index}
              initial={{ opacity: 0, y: 60 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.8,
                delay: index * 0.15,
                ease: "easeOut",
              }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="group cursor-pointer"
            >
              <div className="bg-brand-primary p-8 border-2 border-brand-accent transition-all duration-300 group-hover:shadow-[8px_8px_0_#ff1493]">
                <div className="flex items-start gap-6">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <Image
                      src={track.image}
                      alt={track.title}
                      width={96}
                      height={96}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-2xl text-brand-accent mb-3">
                      {track.title}
                    </h3>
                    <p className="font-mono text-sm text-white/70 leading-relaxed font-bold">
                      {track.description}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-brand-pink">
                  <span className="font-mono text-xs uppercase tracking-wider font-bold">Learn more</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}