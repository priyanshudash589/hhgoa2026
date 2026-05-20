"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import Image from "next/image";

const navLinks = [
  { label: "Tracks", href: "#tracks" },
  { label: "Speakers", href: "#speakers" },
  { label: "Venue", href: "#venue" },
  { label: "Agenda", href: "#agenda" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "glass-effect bg-brand-black/90 shadow-lg border-b-2 border-brand-accent"
            : "bg-transparent"
        )}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <a href="#" className="relative z-10">
              <Image
                src="/assets/001-vector-54-4.svg"
                alt="HH GOA Logo"
                width={113}
                height={99}
                className="h-12 w-auto"
              />
            </a>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <NavLink key={link.label} href={link.href}>
                  {link.label}
                </NavLink>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-4">
              <motion.a
                href="#cta"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-brand-accent text-black px-6 py-3 font-mono font-semibold text-sm uppercase tracking-wider hover:shadow-[4px_4px_0_#ff1493] transition-all"
              >
                Apply Now
              </motion.a>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-brand-accent"
              aria-label="Open menu"
            >
              <Menu size={28} />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileMenu
            onClose={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <motion.a
      href={href}
      className="relative font-mono text-sm uppercase tracking-wider text-white group"
      whileHover="hover"
    >
      {children}
      <motion.span
        className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-accent"
        initial={{ width: 0 }}
        whileHover={{ width: "100%" }}
        transition={{ duration: 0.3 }}
      />
    </motion.a>
  );
}

function MobileMenu({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 md:hidden"
    >
      <div
        className="absolute inset-0 bg-brand-black/95 backdrop-blur-lg border-2 border-brand-accent"
        onClick={onClose}
      />

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="absolute right-0 top-0 bottom-0 w-80 bg-brand-black border-l-2 border-brand-accent p-8"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-brand-accent"
          aria-label="Close menu"
        >
          <X size={28} />
        </button>

        <div className="mt-20 flex flex-col gap-8">
          {navLinks.map((link, i) => (
            <motion.a
              key={link.label}
              href={link.href}
              onClick={onClose}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="font-heading text-3xl font-bold text-white"
            >
              {link.label}
            </motion.a>
          ))}
          <motion.a
            href="#cta"
            onClick={onClose}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 inline-flex items-center justify-center bg-brand-accent text-black px-6 py-4 font-mono font-semibold uppercase tracking-wider"
          >
            Apply Now
          </motion.a>
        </div>
      </motion.div>
    </motion.div>
  );
}
