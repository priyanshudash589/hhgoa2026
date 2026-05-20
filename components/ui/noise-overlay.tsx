"use client";

import { motion } from "framer-motion";

interface NoiseOverlayProps {
  opacity?: number;
  className?: string;
  animate?: boolean;
}

export function NoiseOverlay({
  opacity = 0.03,
  className = "",
  animate = true,
}: NoiseOverlayProps) {
  return (
    <motion.div
      className={`pointer-events-none fixed inset-0 z-50 ${className}`}
      animate={animate ? { opacity: [opacity, opacity * 1.5, opacity] } : {}}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        opacity,
      }}
      aria-hidden="true"
    />
  );
}

interface GrainOverlayProps {
  className?: string;
}

export function GrainOverlay({ className = "" }: GrainOverlayProps) {
  return (
    <div
      className={`pointer-events-none fixed inset-0 z-40 ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        opacity: 0.04,
      }}
      aria-hidden="true"
    />
  );
}