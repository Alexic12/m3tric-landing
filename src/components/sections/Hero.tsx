"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Radio, Map, Globe } from "lucide-react";
import { getPlatformUrl } from "@/lib/platform";

const GlobeScene = dynamic(() => import("@/components/three/GlobeScene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-m3-bg-alt" />
  ),
});

export default function Hero() {
  const platformUrl = getPlatformUrl();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-m3-bg-alt to-m3-bg">
      {/* 3D Globe Background */}
      <GlobeScene />

      {/* Subtle overlay for readability */}
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(255,255,255,0.85)_70%)]" />

      {/* Top gradient */}
      <div className="absolute top-0 left-0 right-0 h-32 z-[2] bg-gradient-to-b from-m3-bg-alt to-transparent" />

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-48 z-[2] bg-gradient-to-t from-m3-bg to-transparent" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 rounded-full border border-m3-accent/20 bg-m3-accent/5 px-4 py-1.5 mb-8"
        >
          <span className="glow-dot" />
          <span className="text-xs font-mono text-m3-green-dark uppercase tracking-widest">
            Analítica Espacio-Temporal Multiescala
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-6"
        >
          <span className="block text-m3-green-dark">Del sensor al</span>
          <span className="gradient-text block">territorio.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mx-auto max-w-2xl text-m3-text-muted text-lg sm:text-xl leading-relaxed mb-10"
        >
          M3TRIC transforma datos ambientales y geoespaciales en inteligencia
          operacional — desde sensores individuales hasta territorios completos.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href={platformUrl}
            className="group relative inline-flex items-center gap-2 rounded-full bg-m3-green-dark px-8 py-3.5 text-sm font-semibold text-white hover:shadow-[0_0_30px_rgba(46,204,113,0.25)] transition-all duration-500"
          >
            Entrar a la Plataforma
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5" />
          </a>
          <a
            href="#platform"
            className="inline-flex items-center gap-2 rounded-full border border-m3-border px-8 py-3.5 text-sm text-m3-text-muted hover:text-m3-green-dark hover:border-m3-accent/30 transition-all duration-300"
          >
            Explorar M3TRIC
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>

        {/* Scale indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-20 flex items-center justify-center gap-12 sm:gap-16"
        >
          {[
            { scale: "M1", label: "Microescala", icon: Radio, color: "#2ecc71" },
            { scale: "M2", label: "Mesoescala", icon: Map, color: "#3a8a5c" },
            { scale: "M3", label: "Macroescala", icon: Globe, color: "#1b4332" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.scale} className="text-center group cursor-default">
                <div className="flex justify-center mb-2">
                  <Icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono mb-1" style={{ color: item.color }}>
                  {item.scale}
                </div>
                <div className="text-xs text-m3-text-muted uppercase tracking-wider">
                  {item.label}
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-m3-text-dim">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-8 bg-gradient-to-b from-m3-accent/50 to-transparent"
        />
      </motion.div>
    </section>
  );
}
