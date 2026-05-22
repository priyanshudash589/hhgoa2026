"use client";

import React from "react";
import type { ISourceOptions, OutMode } from "@tsparticles/engine";
import { Particles } from "@tsparticles/react";
import { cn } from "@/lib/utils";

type ParticlesProps = {
  id?: string;
  className?: string;
  particleSize?: number;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleDensity?: number;
};

export const SparklesCore = React.memo(function SparklesCore({
  id,
  className,
  minSize,
  maxSize,
  speed,
  particleColor,
  particleDensity,
}: ParticlesProps) {
  const options: ISourceOptions = {
    background: {
      color: { value: "transparent" },
    },
    fullScreen: { enable: false, zIndex: 1 },
    fpsLimit: 120,
    interactivity: {
      events: {
        onClick: { enable: true, mode: "push" },
        onHover: { enable: false, mode: "repulse" },
        resize: { enable: true },
      },
      modes: {
        push: { quantity: 4 },
        repulse: { distance: 200, duration: 0.4 },
      },
    },
    particles: {
      color: { value: particleColor || "#ffffff" },
      move: {
        enable: true,
        speed: { min: 0.1, max: speed || 1 },
        direction: "none",
        random: false,
        straight: false,
        outModes: { default: "out" },
      },
      number: {
        density: { enable: true, width: 400, height: 400 },
        value: particleDensity || 120,
      },
      opacity: {
        value: { min: 0.1, max: 1 },
        animation: {
          enable: true,
          speed: speed || 4,
          sync: false,
          startValue: "random",
        },
      },
      shape: { type: "circle" },
      size: {
        value: { min: minSize || 1, max: maxSize || 3 },
      },
    },
    detectRetina: true,
  };

  return (
    <Particles
      id={id || "sparkles"}
      className={cn("h-full w-full", className)}
      options={options}
    />
  );
});
