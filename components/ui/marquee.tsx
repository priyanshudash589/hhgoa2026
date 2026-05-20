"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface MarqueeProps {
  children: React.ReactNode;
  speed?: number;
  direction?: "left" | "right";
  className?: string;
  pauseOnHover?: boolean;
}

export function Marquee({
  children,
  speed = 30,
  direction = "left",
  className = "",
  pauseOnHover = true,
}: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    direction === "left" ? ["0%", "-50%"] : ["0%", "50%"]
  );

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
    >
      <motion.div
        className="flex whitespace-nowrap"
        style={{ x }}
        animate={{
          x: direction === "left" ? ["0", "-50%"] : ["0", "50%"],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: speed,
            ease: "linear",
          },
        }}
        whileHover={pauseOnHover ? { animationPlayState: "paused" } : {}}
      >
        <div className="flex items-center">{children}</div>
        <div className="flex items-center">{children}</div>
      </motion.div>
    </div>
  );
}

interface MarqueeTextProps {
  text: string;
  speed?: number;
  className?: string;
}

export function MarqueeText({
  text,
  speed = 20,
  className = "",
}: MarqueeTextProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="flex items-center gap-8"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: speed,
            ease: "linear",
          },
        }}
      >
        {[...Array(10)].map((_, i) => (
          <span key={i} className="font-heading font-black text-6xl uppercase whitespace-nowrap">
            {text}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

interface InfiniteScrollProps {
  items: React.ReactNode[];
  className?: string;
  speed?: number;
}

export function InfiniteScroll({
  items,
  className = "",
}: InfiniteScrollProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="flex animate-marquee">
        <div className="flex items-center gap-12 pr-12">
          {items.map((item, i) => (
            <div key={i} className="flex-shrink-0">
              {item}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-12 pr-12">
          {items.map((item, i) => (
            <div key={`dup-${i}`} className="flex-shrink-0">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
