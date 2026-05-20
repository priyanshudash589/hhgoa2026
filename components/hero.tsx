"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ChevronDown } from "lucide-react";
import Image from "next/image";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const textVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const floatVariants = {
  initial: { y: 0, rotate: -4 },
  animate: {
    y: [-10, 10, -10],
    rotate: [-6, 2, -6],
  },
};

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen bg-brand-black overflow-hidden"
    >
      <motion.div style={{ y }} className="absolute inset-0">
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <span className="font-heading font-black text-[20vw] text-brand-primary leading-none">
            HOUSE
          </span>
        </div>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 min-h-screen flex flex-col">
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Image
            src="/assets/001-vector-54-4.svg"
            alt="HH GOA"
            width={113}
            height={99}
            className="h-16 w-auto"
          />
          
          <div className="hidden md:flex items-center gap-6 font-mono text-sm text-white">
            {["page", "page", "page", "page", "page", "page"].map((item, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: i * 0.1 + 0.5 }}
                className="uppercase tracking-wider"
              >
                {item}
              </motion.span>
            ))}
          </div>

          <motion.a
            href="#cta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="bg-brand-accent text-black px-5 py-2.5 font-mono font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition-all"
          >
            CTA
          </motion.a>
        </motion.div>

        <div className="flex-1 flex flex-col justify-center items-center text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative"
          >
            <motion.h1
              variants={textVariants}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="font-heading font-black text-responsive-hero text-white leading-[0.9] tracking-tight"
            >
              Hacker
              <br />
              <span className="text-brand-accent">house</span>
            </motion.h1>

            <motion.div
              variants={floatVariants}
              initial="initial"
              animate="animate"
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-8 top-1/4 -translate-y-1/2"
            >
              <Image
                src="/assets/010-gaaevaa-54-427.svg"
                alt="gaaevaa"
                width={280}
                height={280}
                className="w-48 md:w-72 lg:w-80 drop-shadow-xl"
              />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-16 max-w-md"
          >
            <div className="bg-brand-primary p-8 border-2 border-brand-accent">
              <p className="text-brand-accent font-mono text-sm mb-4 uppercase tracking-wider font-bold">
                Coming Soon
              </p>
              <p className="text-white font-mono text-xs leading-relaxed">
                An immersive 4-day hacker experience in Goa, India
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-16 flex flex-col md:flex-row items-center justify-center gap-6"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="flex items-center gap-4"
          >
            <span className="text-brand-accent font-mono text-sm uppercase tracking-wider font-bold">
              GOA, INDIA · 28 – 31 OCT 2026
            </span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="hidden md:block w-1 h-1 bg-brand-accent rounded-full"
          />
          
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            className="text-brand-pink font-mono text-sm uppercase tracking-wider font-bold"
          >
            2:47 pm Studio
          </motion.span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.a
            href="#cta"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-brand-accent text-black px-8 py-4 font-mono font-bold text-base uppercase tracking-wider shadow-[4px_4px_0_#ff1493] hover:shadow-[6px_6px_0_#ff1493] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
          >
            Apply Now
          </motion.a>
          
          <motion.a
            href="#tracks"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="border-2 border-brand-accent text-brand-accent px-8 py-4 font-mono font-bold text-base uppercase tracking-wider hover:bg-brand-accent hover:text-black transition-all"
          >
            Explore Tracks
          </motion.a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown size={32} className="text-brand-accent" />
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        style={{ opacity }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-black to-transparent" />
      </motion.div>
    </section>
  );
}