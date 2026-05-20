"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date("2026-10-28T00:00:00");

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-4 md:gap-8">
      {[
        { value: timeLeft.days, label: "Days" },
        { value: timeLeft.hours, label: "Hours" },
        { value: timeLeft.minutes, label: "Min" },
        { value: timeLeft.seconds, label: "Sec" },
      ].map((item, i) => (
        <div key={i} className="text-center">
          <div className="bg-brand-primary border-2 border-brand-accent px-4 py-3 md:px-6 md:py-4">
            <span className="font-heading font-black text-3xl md:text-5xl text-brand-accent">
              {item.value.toString().padStart(2, "0")}
            </span>
          </div>
          <span className="font-mono text-xs uppercase tracking-wider text-white/60 mt-2 block font-bold">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function FinalCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="cta" ref={ref} className="relative bg-black py-20 md:py-32 overflow-hidden border-t-2 border-brand-accent">
      <motion.div
        animate={{
          y: [0, -15, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-8 right-8 md:top-16 md:right-16"
      >
        <Image
          src="/assets/010-gaaevaa-54-427.svg"
          alt=""
          width={150}
          height={150}
          className="w-24 md:w-40 opacity-20"
        />
      </motion.div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <p className="font-mono text-sm uppercase tracking-widest text-brand-accent mb-6 font-bold">
            GOA, INDIA · 28 – 31 OCT 2026
          </p>
          
          <h2 className="font-heading font-black text-responsive-section text-white mb-8 leading-[0.95]">
            Ready to
            <br />
            <span className="text-brand-accent">Build?</span>
          </h2>

          <p className="font-mono text-base text-white/70 mb-12 max-w-lg mx-auto font-bold">
            Join 390+ hackers for 4 days of building, learning, and creating something extraordinary.
          </p>

          <div className="mb-12">
            <p className="font-mono text-xs uppercase tracking-wider text-white/40 mb-6 font-bold">
              Event starts in
            </p>
            <CountdownTimer />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.a
              href="https://forms.example.com/apply"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto bg-brand-accent text-black px-10 py-5 font-mono font-bold text-lg uppercase tracking-wider shadow-[6px_6px_0_#ff1493] hover:shadow-[8px_8px_0_#ff1493] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
            >
              Apply Now
            </motion.a>
            
            <motion.a
              href="https://discord.gg/hhgoa"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto bg-transparent border-2 border-brand-accent text-brand-accent px-10 py-5 font-mono font-bold text-lg uppercase tracking-wider hover:bg-brand-accent hover:text-black transition-all"
            >
              Join Discord
            </motion.a>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-brand-pink/20 to-transparent pointer-events-none" />
    </section>
  );
}