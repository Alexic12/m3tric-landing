"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { getPlatformUrl } from "@/lib/platform";

export default function PlatformSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const platformUrl = getPlatformUrl();

  return (
    <section id="platform" className="relative py-32 sm:py-40" ref={ref}>
      <div className="glow-line mb-32" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <span className="text-xs font-mono text-m3-accent uppercase tracking-widest mb-4 block">
              La Plataforma
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
              Inteligencia en{" "}
              <span className="gradient-text">cada capa.</span>
            </h2>
            <p className="text-m3-text-muted text-lg leading-relaxed mb-8">
              M3TRIC es un stack completo de analítica geoespacial — desde la
              recolección de datos en el borde hasta el procesamiento
              espacio-temporal y la visualización ejecutiva.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {[
                { value: "3", label: "Escalas" },
                { value: "4", label: "Pilares" },
                { value: "∞", label: "Fuentes" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl sm:text-3xl font-bold gradient-text-warm">
                    {stat.value}
                  </div>
                  <div className="text-xs text-m3-text-muted mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <a
                href={platformUrl}
                className="group inline-flex items-center gap-2 rounded-full bg-m3-green-dark px-6 py-3 text-sm font-semibold text-white hover:bg-m3-green-mid transition-colors"
              >
                Conectar con la plataforma
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5" />
              </a>
              <a
                href="#products"
                className="group inline-flex items-center gap-2 text-sm text-m3-accent hover:text-m3-green-dark transition-colors"
              >
                Explorar productos
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </motion.div>

          {/* Right — Architecture */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-card rounded-2xl p-6 sm:p-8"
          >
            <div className="space-y-3 font-mono text-xs">
              {/* Sensórica */}
              <div className="rounded-xl border border-m3-accent/20 p-4">
                <div className="text-m3-accent mb-2 text-[10px] uppercase tracking-wider">Sensórica — Generación de Datos</div>
                <div className="flex flex-wrap gap-2">
                  {["Sensores IoT", "Drones", "Radares", "Satélites"].map((t) => (
                    <span key={t} className="rounded-md bg-m3-accent/10 px-2 py-0.5 text-m3-accent">{t}</span>
                  ))}
                </div>
              </div>

              <div className="flex justify-center text-m3-text-dim">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>

              {/* Visualización */}
              <div className="rounded-xl border border-m3-green-mid/30 p-4">
                <div className="text-m3-green-mid mb-2 text-[10px] uppercase tracking-wider">Visualización — Motor de Gestión</div>
                <div className="flex flex-wrap gap-2">
                  {["Dashboards", "Reportes", "Alertas", "Recomendaciones"].map((t) => (
                    <span key={t} className="rounded-md bg-m3-green-mid/10 px-2 py-0.5 text-m3-green-mid">{t}</span>
                  ))}
                </div>
              </div>

              <div className="flex justify-center text-m3-text-dim">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>

              {/* Análisis */}
              <div className="rounded-xl border border-m3-accent-blue/20 p-4">
                <div className="text-m3-accent-blue mb-2 text-[10px] uppercase tracking-wider">Análisis de Datos — Estrategia</div>
                <div className="flex flex-wrap gap-2">
                  {["Series Temporales", "Geoestadística", "Heurística", "Umbrales"].map((t) => (
                    <span key={t} className="rounded-md bg-m3-accent-blue/10 px-2 py-0.5 text-m3-accent-blue">{t}</span>
                  ))}
                </div>
              </div>

              <div className="flex justify-center text-m3-text-dim">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>

              {/* Modelos Predictivos */}
              <div className="rounded-xl border border-m3-accent-amber/20 p-4">
                <div className="text-m3-accent-amber mb-2 text-[10px] uppercase tracking-wider">Modelos Predictivos — IA</div>
                <div className="flex flex-wrap gap-2">
                  {["Eventos Pasados", "Pronósticos", "Escenarios", "Gemelo Digital"].map((t) => (
                    <span key={t} className="rounded-md bg-m3-accent-amber/10 px-2 py-0.5 text-m3-accent-amber">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
