"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { InfiniteScroll } from "./ui/marquee";

const sponsors = {
  title: ["Aptos", "Microsoft", "Google", "AWS", "Polygon", "Chainlink"],
  coPowered: ["Stacks", "Solana", "Near", "Avalanche", "Filecoin", "Livepeer"],
  community: ["ETHGlobal", "Devfolio", "MLH", "Gitcoin", "Bankless", "Snapshot"],
};

export function Sponsors() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative bg-brand-pink py-20 md:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-16 text-center"
        >
          <h2 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-white mb-4">
            Title Sponsors
          </h2>
          <p className="font-mono text-sm text-white/70 uppercase tracking-wider font-bold">
            Partners making Hacker House Goa possible
          </p>
        </motion.div>

        <div className="relative mb-16">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-brand-pink to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-brand-pink to-transparent z-10" />
          
          <div className="overflow-hidden">
            <InfiniteScroll
              items={sponsors.title.map((name, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.1 }}
                  className="bg-black px-12 py-6 font-heading font-bold text-xl text-brand-accent border-2 border-brand-accent"
                >
                  {name}
                </motion.div>
              ))}
              speed={25}
            />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-16 text-center"
        >
          <h3 className="font-heading font-bold text-2xl md:text-3xl text-white mb-6 font-bold">
            Co-Powered By
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {sponsors.coPowered.map((name, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className="bg-black px-6 py-3 font-mono text-sm text-brand-accent border-2 border-brand-accent font-bold"
              >
                {name}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center"
        >
          <h3 className="font-heading font-bold text-xl text-white mb-6 font-bold">
            Community Partners
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {sponsors.community.map((name, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                className="bg-black px-5 py-2.5 font-mono text-xs text-white border-2 border-white hover:border-brand-accent transition-all font-bold"
              >
                {name}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}