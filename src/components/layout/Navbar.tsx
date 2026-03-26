"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { M3tricLogoMark } from "@/components/brand/M3tricLogo";
import { getPlatformUrl } from "@/lib/platform";

const navLinks = [
  { label: "Plataforma", href: "#platform" },
  { label: "Escalas", href: "#scales" },
  { label: "Productos", href: "#products" },
  { label: "Tecnología", href: "#technology" },
  { label: "Casos de Uso", href: "#use-cases" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const platformUrl = getPlatformUrl();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass py-3 shadow-sm"
          : "bg-transparent py-5"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <a href="#" className="flex items-center gap-1.5 group">
          <M3tricLogoMark size={36} />
          <span className="text-xl font-bold tracking-tight" style={{ color: "#1b4332" }}>
            3TRIC
          </span>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-m3-text-muted hover:text-m3-green-dark transition-colors duration-300 relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-m3-accent transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* CTA + Mobile Toggle */}
        <div className="flex items-center gap-4">
          <a
            href={platformUrl}
            className="hidden lg:inline-flex items-center gap-2 rounded-full border border-m3-green-dark/15 bg-white/80 px-5 py-2 text-sm font-medium text-m3-green-dark hover:border-m3-accent/40 hover:bg-white transition-all duration-300"
          >
            Abrir Plataforma
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
          <a
            href="#contact"
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-m3-green-dark px-5 py-2 text-sm text-white font-medium hover:bg-m3-green-mid transition-all duration-300"
          >
            Solicitar Demo
            <ArrowRight className="w-3.5 h-3.5" />
          </a>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-1.5"
            aria-label="Toggle navigation"
          >
            <span className={`block w-5 h-px bg-m3-green-dark transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[3.5px]" : ""}`} />
            <span className={`block w-5 h-px bg-m3-green-dark transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[3.5px]" : ""}`} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-m3-border/30 overflow-hidden"
          >
            <div className="px-6 py-6 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block text-sm text-m3-text-muted hover:text-m3-green-dark transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <a
                href={platformUrl}
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center gap-2 rounded-full border border-m3-green-dark/15 bg-white px-5 py-2 text-sm font-medium text-m3-green-dark"
              >
                Abrir Plataforma
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
              <a
                href="#contact"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center gap-2 rounded-full bg-m3-green-dark px-5 py-2 text-sm text-white font-medium"
              >
                Solicitar Demo
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
