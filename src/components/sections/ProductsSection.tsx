"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Radio,
  Radar,
  Satellite,
  Plane,
  LayoutDashboard,
  FileText,
  Bell,
  TrendingUp,
  BarChart3,
  MapPinned,
  Brain,
  Calendar,
  Layers,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Pillar {
  title: string;
  subtitle: string;
  description: string;
  items: { label: string; icon: LucideIcon }[];
  accentColor: string;
}

const pillars: Pillar[] = [
  {
    title: "Sensórica",
    subtitle: "Generación de datos",
    description:
      "Fuentes de datos multiescala desde el nivel de suelo hasta la órbita. Integración de múltiples protocolos y formatos para construir una visión completa del territorio.",
    items: [
      { label: "IoT – Sensores y protocolos", icon: Radio },
      { label: "Drones", icon: Plane },
      { label: "Radares", icon: Radar },
      { label: "Satélites", icon: Satellite },
    ],
    accentColor: "#2ecc71",
  },
  {
    title: "Visualización",
    subtitle: "Motor de gestión",
    description:
      "Interfaces de visualización que traducen datos complejos en información accionable. Desde tableros operativos en tiempo real hasta informes ejecutivos automatizados.",
    items: [
      { label: "Tableros personalizables", icon: LayoutDashboard },
      { label: "Informes automáticos", icon: FileText },
      { label: "Alertas y recomendaciones", icon: Bell },
    ],
    accentColor: "#1abc9c",
  },
  {
    title: "Análisis de Datos",
    subtitle: "Estrategia",
    description:
      "Herramientas analíticas avanzadas que combinan análisis temporal, espacial y espacio-temporal para descubrir patrones, detectar anomalías y generar inteligencia territorial.",
    items: [
      { label: "Series de tiempo", icon: TrendingUp },
      { label: "Umbralización", icon: BarChart3 },
      { label: "Geoestadística", icon: MapPinned },
      { label: "Heurísticos", icon: Layers },
    ],
    accentColor: "#3a8a5c",
  },
  {
    title: "Modelos Predictivos",
    subtitle: "Inteligencia anticipada",
    description:
      "Modelos basados en datos que combinan física, estadística e inteligencia artificial para anticipar escenarios futuros y soportar la toma de decisiones proactiva.",
    items: [
      { label: "Eventos pasados y pronóstico", icon: Calendar },
      { label: "Escenarios", icon: TrendingUp },
      { label: "Inteligencia Artificial", icon: Brain },
    ],
    accentColor: "#6dbe6d",
  },
];

export default function ProductsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="products" className="relative py-32 sm:py-40" ref={ref}>
      <div className="glow-line mb-32" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Layers className="w-5 h-5 text-m3-accent" />
            <span className="text-xs font-mono text-m3-accent uppercase tracking-widest">
              Productos y Herramientas
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Soluciones{" "}
            <span className="gradient-text">integrales.</span>
          </h2>
          <p className="text-m3-text-muted text-lg leading-relaxed">
            Productos generalistas con herramientas especializadas.
            Enfoque generalista en sectores, pero especializado en datos
            físicos y su interpretación.
          </p>
        </motion.div>

        {/* Pillars grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.15 * i }}
              className="glass-card rounded-2xl p-8 group relative overflow-hidden"
            >
              {/* Background glow */}
              <div
                className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle, ${pillar.accentColor}, transparent 70%)`,
                }}
              />

              {/* Header */}
              <div className="relative mb-6">
                <div className="flex items-center gap-3 mb-1">
                  <span
                    className="text-xs font-mono uppercase tracking-widest"
                    style={{ color: pillar.accentColor }}
                  >
                    {pillar.subtitle}
                  </span>
                </div>
                <h3 className="text-2xl font-bold">{pillar.title}</h3>
              </div>

              {/* Description */}
              <p className="text-sm text-m3-text-muted leading-relaxed mb-6 relative">
                {pillar.description}
              </p>

              {/* Items */}
              <div className="space-y-3 relative">
                {pillar.items.map(({ label, icon: ItemIcon }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-m3-surface/50"
                    style={{
                      border: `1px solid ${pillar.accentColor}10`,
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: `${pillar.accentColor}12`,
                        border: `1px solid ${pillar.accentColor}20`,
                      }}
                    >
                      <ItemIcon
                        className="w-4 h-4"
                        style={{ color: pillar.accentColor }}
                      />
                    </div>
                    <span className="text-sm text-m3-text">{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Analysis matrix */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12 glass-card rounded-2xl p-8"
        >
          <h3 className="text-sm font-mono text-m3-accent uppercase tracking-widest mb-6 text-center">
            Matriz de Análisis
          </h3>
          <div className="grid grid-cols-4 gap-4 text-center text-sm">
            {/* Header row */}
            <div className="text-m3-text-dim" />
            <div className="text-m3-text-muted font-mono text-xs">
              Análisis Temporal
            </div>
            <div className="text-m3-text-muted font-mono text-xs">
              Análisis Espacial
            </div>
            <div className="text-m3-text-muted font-mono text-xs">
              Análisis Espacio-Temporal
            </div>

            {/* M1 row */}
            <div className="text-left font-semibold" style={{ color: "#2ecc71" }}>
              M1 Micro
            </div>
            {[1, 2, 3].map((j) => (
              <div
                key={`m1-${j}`}
                className="rounded-lg py-3 transition-all hover:scale-105"
                style={{
                  background: `rgba(46, 204, 113, ${0.04 + j * 0.03})`,
                  border: "1px solid rgba(46, 204, 113, 0.1)",
                }}
              >
                <div className="w-2 h-2 rounded-full mx-auto" style={{ background: "#2ecc71" }} />
              </div>
            ))}

            {/* M2 row */}
            <div className="text-left font-semibold" style={{ color: "#3a8a5c" }}>
              M2 Meso
            </div>
            {[1, 2, 3].map((j) => (
              <div
                key={`m2-${j}`}
                className="rounded-lg py-3 transition-all hover:scale-105"
                style={{
                  background: `rgba(58, 138, 92, ${0.04 + j * 0.03})`,
                  border: "1px solid rgba(58, 138, 92, 0.1)",
                }}
              >
                <div className="w-2 h-2 rounded-full mx-auto" style={{ background: "#3a8a5c" }} />
              </div>
            ))}

            {/* M3 row */}
            <div className="text-left font-semibold" style={{ color: "#6dbe6d" }}>
              M3 Macro
            </div>
            {[1, 2, 3].map((j) => (
              <div
                key={`m3-${j}`}
                className="rounded-lg py-3 transition-all hover:scale-105"
                style={{
                  background: `rgba(109, 190, 109, ${0.04 + j * 0.03})`,
                  border: "1px solid rgba(109, 190, 109, 0.1)",
                }}
              >
                <div className="w-2 h-2 rounded-full mx-auto" style={{ background: "#6dbe6d" }} />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
