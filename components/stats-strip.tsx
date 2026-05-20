"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface StatItem {
  value: string;
  label: string;
  color?: string;
}

const stats: StatItem[] = [
  { value: "6800+", label: "Registrations 2024", color: "text-brand-accent" },
  { value: "100", label: "Projects", color: "text-brand-pink" },
  { value: "390+", label: "Hackers", color: "text-brand-accent" },
  { value: "$50k+", label: "Bounties 2026", color: "text-brand-pink" },
];

function parseStatValue(value: string) {
  const numericValue = parseInt(value.replace(/[^0-9]/g, ""), 10);
  const prefix = value.match(/^[^0-9]*/)?.[0] || "";
  const suffix = value.match(/[^0-9]*$/)?.[0] || "";

  return {
    numericValue,
    prefix,
    suffix,
    isNumeric: !Number.isNaN(numericValue),
  };
}

function AnimatedNumber({ value, isInView }: { value: string; isInView: boolean }) {
  const parsed = useMemo(() => parseStatValue(value), [value]);
  const [displayValue, setDisplayValue] = useState(parsed.isNumeric ? "0" : value);

  useEffect(() => {
    if (!isInView || !parsed.isNumeric) return;

    let start = 0;
    const duration = 1500;
    const step = 16;
    const increment = parsed.numericValue / (duration / step);

    const timer = setInterval(() => {
      start += increment;
      if (start >= parsed.numericValue) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(`${parsed.prefix}${Math.floor(start)}${parsed.suffix}`);
      }
    }, step);

    return () => clearInterval(timer);
  }, [value, isInView, parsed]);

  return <span>{parsed.isNumeric ? displayValue : value}</span>;
}

export function StatsStrip() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative bg-brand-black py-16 md:py-24 border-y-2 border-brand-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
                ease: "easeOut",
              }}
              className="relative text-center px-4"
            >
              <div className="relative inline-block">
                <motion.h3
                  className={`font-heading font-black text-5xl md:text-6xl lg:text-7xl ${stat.color} leading-none`}
                >
                  <AnimatedNumber value={stat.value} isInView={isInView} />
                </motion.h3>
                <motion.div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-1 bg-brand-primary"
                  initial={{ width: 0 }}
                  animate={isInView ? { width: "80%" } : {}}
                  transition={{ duration: 0.8, delay: index * 0.15 + 0.3 }}
                />
              </div>
              <p className="mt-6 font-mono text-xs md:text-sm uppercase tracking-widest text-white/70 font-bold">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
