"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

const socialLinks = [
  { icon: "/assets/180-frame-1948754793-54-30952.svg", href: "https://twitter.com/hhgoa", label: "Twitter" },
  { icon: "/assets/181-frame-1948754789-54-30958.svg", href: "https://instagram.com/hhgoa", label: "Instagram" },
  { icon: "/assets/182-frame-1948754788-54-30962.svg", href: "https://linkedin.com/company/hhgoa", label: "LinkedIn" },
];

const footerLinks = [
  { label: "Brand Kit", href: "#" },
  { label: "Term & Conditions", href: "#" },
  { label: "Privacy", href: "#" },
];

export function Footer() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <footer ref={ref} className="relative bg-brand-pink py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <Image
            src="/assets/001-vector-54-4.svg"
            alt="HH GOA"
            width={113}
            height={99}
            className="h-16 w-auto mx-auto mb-8"
          />
          
          <p className="font-mono text-sm text-white/50 uppercase tracking-wider mb-4 font-bold">
            GOA, INDIA · 28 – 31 OCT 2026
          </p>
          
          <p className="font-mono text-sm text-white/50 mb-2 font-bold">
            2:47 pm Studio
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center justify-center gap-6 mb-12"
        >
          {socialLinks.map((social) => (
            <motion.a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, y: -4 }}
              className="w-12 h-12 flex items-center justify-center border-2 border-white text-white hover:border-brand-accent hover:text-brand-accent transition-all duration-300 p-2"
            >
              <Image
                src={social.icon}
                alt={social.label}
                width={24}
                height={24}
                className="w-full h-full"
              />
            </motion.a>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-6 mb-12"
        >
          {footerLinks.map((link) => (
            <motion.a
              key={link.label}
              href={link.href}
              whileHover={{ color: "#ffd700" }}
              className="font-mono text-xs uppercase tracking-wider text-white/40 hover:text-brand-accent transition-colors font-bold"
            >
              {link.label}
            </motion.a>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="border-t border-white/10 pt-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-mono text-xs text-white/30 font-bold">
              © 2026 HH-Goa. All rights reserved.
            </p>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-white/40 font-bold">@247pmstudio</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-white/40 font-bold">@theprayasu</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
