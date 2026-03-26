"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Zap,
  BarChart3,
  AlertTriangle,
  Map,
  Bell,
  FileText,
  Cpu,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DataFlowIllustration, DashboardIllustration } from "@/components/illustrations/ScaleIllustrations";

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  accentColor: string;
}

const features: Feature[] = [
  {
    title: "Ingesta en Tiempo Real",
    description: "Pipeline multi-fuente que procesa sensores IoT, límites GeoJSON e imágenes ráster con validación y normalización automática.",
    icon: Zap,
    accentColor: "#2ecc71",
  },
  {
    title: "Análisis Espacio-Temporal",
    description: "Agregación temporal configurable, análisis de grilla espacial y resúmenes multiescala desde lecturas individuales hasta panorámicas territoriales.",
    icon: BarChart3,
    accentColor: "#3a8a5c",
  },
  {
    title: "Detección de Anomalías",
    description: "Análisis estadístico Z-score, monitoreo de umbrales y clustering espacial DBSCAN para detectar outliers y patrones emergentes.",
    icon: AlertTriangle,
    accentColor: "#f39c12",
  },
  {
    title: "Dashboard GIS Interactivo",
    description: "Visualización WebGL con capas de sensores, marcadores de eventos, mapas de calor y polígonos regionales en tiempo real.",
    icon: Map,
    accentColor: "#2980b9",
  },
  {
    title: "Umbralización Adaptativa",
    description: "Motor de alertas basado en reglas con umbrales configurables, períodos de enfriamiento y notificaciones multicanal.",
    icon: Bell,
    accentColor: "#e74c3c",
  },
  {
    title: "Generación de Reportes",
    description: "Reportes programados y bajo demanda con exportación a PDF, CSV y GeoJSON. Plantillas diarias, semanales y mensuales.",
    icon: FileText,
    accentColor: "#1abc9c",
  },
];

export default function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="relative py-32 sm:py-40" ref={ref}>
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
            <Cpu className="w-5 h-5 text-m3-accent" />
            <span className="text-xs font-mono text-m3-accent uppercase tracking-widest">
              Capacidades
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Herramientas para{" "}
            <span className="gradient-text">operaciones críticas.</span>
          </h2>
          <p className="text-m3-text-muted text-lg leading-relaxed">
            Cada componente diseñado para confiabilidad, rendimiento y escala
            — desde la ingesta de datos hasta reportes ejecutivos.
          </p>
        </motion.div>

        {/* Architecture illustrations row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="grid gap-6 md:grid-cols-2 mb-12"
        >
          <div className="glass-card rounded-2xl p-6">
            <p className="text-xs font-mono text-m3-accent uppercase tracking-widest mb-3">Flujo de Datos</p>
            <DataFlowIllustration className="w-full h-auto" />
          </div>
          <div className="glass-card rounded-2xl p-6">
            <p className="text-xs font-mono text-m3-green-mid uppercase tracking-widest mb-3">Vista del Dashboard</p>
            <DashboardIllustration className="w-full h-auto" />
          </div>
        </motion.div>

        {/* Feature grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 * i + 0.3 }}
                className="glass-card rounded-2xl p-7 group"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: `${feature.accentColor}10`,
                    border: `1px solid ${feature.accentColor}30`,
                  }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: feature.accentColor }}
                  />
                </div>
                <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-m3-text-muted leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
