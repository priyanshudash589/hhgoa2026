"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

const bounties = [
  { prize: "$2000", title: "Layer_1", icon: "/assets/159-frame-1948755156-54-28521.svg" },
  { prize: "$2000", title: "Layer_1", icon: "/assets/160-frame-1948755155-54-28604.svg" },
  { prize: "$2000", title: "Layer_1", icon: "/assets/161-frame-1948755156-54-28685.svg" },
  { prize: "$2000", title: "Layer_1", icon: "/assets/162-frame-1948755155-54-28768.svg" },
  { prize: "$2000", title: "Layer_1", icon: "/assets/163-frame-1948755156-54-28849.svg" },
  { prize: "$2000", title: "Layer_1", icon: "/assets/164-frame-1948755155-54-28932.svg" },
];

export function Bounties() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative bg-brand-primary py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-16 text-center"
        >
          <h2 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-white mb-4">
            Bounties 2026
          </h2>
          <p className="font-mono text-sm text-brand-accent uppercase tracking-wider font-bold">
            Win exciting prizes across multiple categories
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bounties.map((bounty, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: "easeOut",
              }}
              whileHover={{ scale: 1.05, y: -8 }}
              className="group cursor-pointer"
            >
              <div className="relative bg-black border-2 border-brand-accent p-8 transition-all duration-300 group-hover:shadow-[8px_8px_0_#ffd700]">
                <div className="absolute top-4 right-4">
                  <Image
                    src={bounty.icon}
                    alt=""
                    width={40}
                    height={40}
                    className="w-10 h-10"
                  />
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="font-heading font-black text-5xl md:text-6xl text-brand-accent mb-4">
                    {bounty.prize}
                  </span>
                  <span className="font-mono text-sm text-white/60 uppercase tracking-wider font-bold">
                    {bounty.title}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}