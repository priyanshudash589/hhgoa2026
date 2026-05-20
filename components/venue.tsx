"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";

export function Venue() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="venue" ref={ref} className="relative bg-black py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <p className="font-mono text-xs uppercase tracking-widest text-brand-accent mb-4 font-bold">
              The Location
            </p>
            <h2 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-white mb-6">
              Venue
            </h2>
            <h3 className="font-heading font-bold text-2xl md:text-3xl text-brand-accent mb-8">
              GOA BEACH RESORT
            </h3>
            
            <div className="flex items-start gap-4 mb-8">
              <MapPin className="w-6 h-6 text-brand-pink flex-shrink-0 mt-1" />
              <div>
                <p className="font-mono text-sm text-white/80 leading-relaxed font-bold">
                  Building 5, DLF Cyber Hub,<br />
                  Sector 24, Goa,<br />
                  India
                </p>
              </div>
            </div>

            <motion.a
              href="https://maps.google.com/?q=Goa+Beach+Resort"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-3 bg-brand-accent text-black px-8 py-4 font-mono font-semibold text-sm uppercase tracking-wider shadow-[4px_4px_0_#ff1493] hover:shadow-[6px_6px_0_#ff1493] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
            >
              <Navigation className="w-5 h-5" />
              Get Directions
            </motion.a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative aspect-square lg:aspect-[4/3] bg-brand-primary border-2 border-brand-accent overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <MapPin className="w-16 h-16 text-brand-accent mx-auto mb-4" />
                  <p className="font-mono text-sm text-white/60 uppercase tracking-wider font-bold">
                    Interactive Map
                  </p>
                </div>
              </div>
              
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-4 -right-4 bg-brand-pink px-4 py-2 font-mono text-xs font-bold text-white"
              >
                LIVE LOCATION
              </motion.div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { label: "Nearest Airport", value: "Goa International Airport (GOI)", distance: "45 km" },
            { label: "Nearest Railway", value: "Thivim Railway Station", distance: "20 km" },
            { label: "City Center", value: "Panaji", distance: "15 km" },
          ].map((item, i) => (
            <div key={i} className="bg-brand-primary p-6 border-2 border-brand-accent">
              <p className="font-mono text-xs uppercase tracking-wider text-brand-accent mb-2 font-bold">
                {item.label}
              </p>
              <p className="font-mono text-sm text-white font-bold mb-1">
                {item.value}
              </p>
              <p className="font-mono text-xs text-white/40 font-bold">
                {item.distance}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}