"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Trees, Building2, Wheat, Mountain } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface UseCase {
  title: string;
  sector: string;
  description: string;
  tags: string[];
  icon: LucideIcon;
  accentColor: string;
}

const useCases: UseCase[] = [
  {
    title: "Monitoreo Ambiental",
    sector: "Ambiental",
    description: "Redes de sensores para rastrear calidad del aire, niveles de agua, condiciones del suelo y patrones climáticos. Detecta anomalías antes de que se conviertan en emergencias.",
    tags: ["Calidad del Aire", "Recursos Hídricos", "Datos Climáticos"],
    icon: Trees,
    accentColor: "#2ecc71",
  },
  {
    title: "Gestión de Geoamenazas",
    sector: "Geo",
    description: "Sistemas de alerta temprana impulsados por clustering espacial y detección de umbrales. Alertas automáticas multicanal cuando las condiciones exceden parámetros seguros.",
    tags: ["Alerta Temprana", "Mapeo de Riesgo", "DAGRD"],
    icon: Mountain,
    accentColor: "#e74c3c",
  },
  {
    title: "Planificación Territorial",
    sector: "Geo",
    description: "Agregación de datos sensoriales a escala territorial para optimizar infraestructura y ordenamiento. Políticas basadas en evidencia.",
    tags: ["POT Medellín", "Infraestructura", "Ordenamiento"],
    icon: Building2,
    accentColor: "#2980b9",
  },
  {
    title: "Inteligencia Agrícola",
    sector: "Agro",
    description: "Monitoreo de condiciones de cultivo, humedad del suelo y variables microclimáticas. Generación de mapas de prescripción desde datos espaciales multifuente.",
    tags: ["Agricultura de Precisión", "Citrícola", "Uniban"],
    icon: Wheat,
    accentColor: "#f39c12",
  },
];

export default function UseCasesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="use-cases" className="relative py-32 sm:py-40" ref={ref}>
      <div className="glow-line mb-32" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="text-xs font-mono text-m3-accent uppercase tracking-widest mb-4 block">
            Casos de Uso
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Construido para{" "}
            <span className="gradient-text">impacto real.</span>
          </h2>
          <p className="text-m3-text-muted text-lg leading-relaxed">
            Desde agencias ambientales hasta ciudades inteligentes — M3TRIC proporciona la
            base analítica para decisiones territoriales basadas en datos.
          </p>
        </motion.div>

        {/* Use case cards */}
        <div className="grid gap-6 sm:grid-cols-2">
          {useCases.map((uc, i) => {
            const Icon = uc.icon;
            return (
              <motion.div
                key={uc.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 * i }}
                className="glass-card rounded-2xl p-8 group relative overflow-hidden"
              >
                {/* Background glow */}
                <div
                  className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle, ${uc.accentColor}, transparent 70%)`,
                  }}
                />

                {/* Sector badge + icon */}
                <div className="flex items-center gap-3 mb-4 relative">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `${uc.accentColor}10`,
                      border: `1px solid ${uc.accentColor}25`,
                    }}
                  >
                    <Icon className="w-7 h-7" style={{ color: uc.accentColor }} />
                  </div>
                  <span
                    className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full"
                    style={{
                      background: `${uc.accentColor}10`,
                      color: uc.accentColor,
                      border: `1px solid ${uc.accentColor}20`,
                    }}
                  >
                    {uc.sector}
                  </span>
                </div>

                <h3 className="text-xl font-semibold mb-3 relative">{uc.title}</h3>
                <p className="text-sm text-m3-text-muted leading-relaxed mb-5 relative">
                  {uc.description}
                </p>
                <div className="flex flex-wrap gap-2 relative">
                  {uc.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full px-3 py-1 text-xs"
                      style={{
                        background: `${uc.accentColor}08`,
                        border: `1px solid ${uc.accentColor}20`,
                        color: uc.accentColor,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
