"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { SatelliteDish } from "lucide-react";

const scales = [
  {
    id: "M3",
    label: "Macroescala",
    color: "#1b4332",
    lightColor: "#6dbe6d",
    description: "Imágenes satelitales y datos de radar para análisis territorial a gran escala. Monitoreo regional de cambios en cobertura, uso del suelo y dinámicas ambientales.",
    icon: (
      <svg viewBox="0 0 120 80" className="w-full h-full" fill="none">
        {/* Satellite 1 - larger with solar panels */}
        <g transform="translate(15, 10) scale(0.9)">
          <rect x="-5" y="15" width="22" height="14" rx="2" fill="#6dbe6d" stroke="#1b4332" strokeWidth="1" />
          <line x1="1" y1="15" x2="1" y2="29" stroke="#1b4332" strokeWidth="0.6" />
          <line x1="6" y1="15" x2="6" y2="29" stroke="#1b4332" strokeWidth="0.6" />
          <line x1="11" y1="15" x2="11" y2="29" stroke="#1b4332" strokeWidth="0.6" />
          <rect x="17" y="12" width="16" height="20" rx="3" fill="#3a8a5c" stroke="#1b4332" strokeWidth="1" />
          <circle cx="25" cy="22" r="4" fill="#1b4332" opacity="0.3" />
          <rect x="33" y="15" width="22" height="14" rx="2" fill="#6dbe6d" stroke="#1b4332" strokeWidth="1" />
          <line x1="39" y1="15" x2="39" y2="29" stroke="#1b4332" strokeWidth="0.6" />
          <line x1="44" y1="15" x2="44" y2="29" stroke="#1b4332" strokeWidth="0.6" />
          <line x1="49" y1="15" x2="49" y2="29" stroke="#1b4332" strokeWidth="0.6" />
        </g>
        {/* Satellite 2 - smaller */}
        <g transform="translate(75, 5) scale(0.55)">
          <rect x="0" y="12" width="14" height="10" rx="1.5" fill="#6dbe6d" stroke="#1b4332" strokeWidth="0.8" />
          <rect x="14" y="8" width="12" height="18" rx="2.5" fill="#3a8a5c" stroke="#1b4332" strokeWidth="0.8" />
          <rect x="26" y="12" width="14" height="10" rx="1.5" fill="#6dbe6d" stroke="#1b4332" strokeWidth="0.8" />
          <line x1="20" y1="26" x2="20" y2="32" stroke="#1b4332" strokeWidth="0.8" />
        </g>
      </svg>
    ),
  },
  {
    id: "M2",
    label: "Mesoescala",
    color: "#3a8a5c",
    lightColor: "#3a8a5c",
    description: "Drones y vehículos aéreos no tripulados para captura de datos a escala intermedia. Fotogrametría, LiDAR, y multiespectrales para análisis detallado de zonas específicas.",
    icon: (
      <svg viewBox="0 0 120 80" className="w-full h-full" fill="none">
        {/* Drone */}
        <g transform="translate(25, 8)">
          {/* Body */}
          <ellipse cx="35" cy="18" rx="12" ry="7" fill="#3a8a5c" />
          {/* Arms */}
          <line x1="23" y1="18" x2="5" y2="8" stroke="#3a8a5c" strokeWidth="2.5" />
          <line x1="47" y1="18" x2="65" y2="8" stroke="#3a8a5c" strokeWidth="2.5" />
          <line x1="23" y1="18" x2="5" y2="28" stroke="#3a8a5c" strokeWidth="2.5" />
          <line x1="47" y1="18" x2="65" y2="28" stroke="#3a8a5c" strokeWidth="2.5" />
          {/* Rotors */}
          <ellipse cx="5" cy="8" rx="9" ry="2.5" fill="#3a8a5c" opacity="0.25" />
          <ellipse cx="65" cy="8" rx="9" ry="2.5" fill="#3a8a5c" opacity="0.25" />
          <ellipse cx="5" cy="28" rx="9" ry="2.5" fill="#3a8a5c" opacity="0.25" />
          <ellipse cx="65" cy="28" rx="9" ry="2.5" fill="#3a8a5c" opacity="0.25" />
          {/* Camera/gimbal */}
          <circle cx="35" cy="25" r="4" fill="#1b4332" opacity="0.6" />
          <circle cx="35" cy="25" r="2" fill="white" opacity="0.4" />
          {/* Scanning beams */}
          <line x1="33" y1="29" x2="15" y2="65" stroke="#3a8a5c" strokeWidth="0.8" opacity="0.3" />
          <line x1="37" y1="29" x2="55" y2="65" stroke="#3a8a5c" strokeWidth="0.8" opacity="0.3" />
          <line x1="35" y1="29" x2="35" y2="65" stroke="#3a8a5c" strokeWidth="0.8" opacity="0.3" />
        </g>
      </svg>
    ),
  },
  {
    id: "M1",
    label: "Microescala",
    color: "#6dbe6d",
    lightColor: "#1b4332",
    description: "Sensores IoT y estaciones de monitoreo in-situ para datos puntuales en tiempo real. Variables ambientales, parámetros de suelo, calidad del agua y condiciones atmosféricas.",
    icon: (
      <svg viewBox="0 0 120 80" className="w-full h-full" fill="none">
        {/* Sensor tower */}
        <g transform="translate(10, 5)">
          {/* Tower base */}
          <line x1="15" y1="35" x2="5" y2="70" stroke="#1b4332" strokeWidth="2" />
          <line x1="15" y1="35" x2="25" y2="70" stroke="#1b4332" strokeWidth="2" />
          <line x1="15" y1="35" x2="15" y2="70" stroke="#1b4332" strokeWidth="1.5" />
          {/* Crossbars */}
          <line x1="8" y1="50" x2="22" y2="50" stroke="#1b4332" strokeWidth="1" />
          <line x1="10" y1="60" x2="20" y2="60" stroke="#1b4332" strokeWidth="1" />
          {/* Antenna box */}
          <rect x="10" y="28" width="10" height="8" rx="2" fill="#3a8a5c" />
          {/* Antenna */}
          <circle cx="15" cy="26" r="3" fill="#1b4332" />
          {/* Signal waves */}
          <path d="M22 22 Q28 18 24 12" stroke="#2ecc71" strokeWidth="1.5" fill="none" opacity="0.6" />
          <path d="M25 24 Q33 18 28 10" stroke="#2ecc71" strokeWidth="1.2" fill="none" opacity="0.4" />
          <path d="M28 26 Q38 18 32 8" stroke="#2ecc71" strokeWidth="0.9" fill="none" opacity="0.25" />
        </g>
        {/* Terrain with sensor nodes */}
        <g transform="translate(40, 15)">
          {/* Terrain hill */}
          <path d="M0 60 Q15 20 35 35 Q55 50 70 25 L70 60 Z" fill="#6dbe6d" opacity="0.15" />
          <path d="M0 60 Q15 20 35 35 Q55 50 70 25" stroke="#6dbe6d" strokeWidth="1.5" fill="none" opacity="0.4" />
          {/* Sensor nodes */}
          <circle cx="15" cy="38" r="3" fill="#2ecc71" />
          <circle cx="38" cy="40" r="3" fill="#2ecc71" />
          <circle cx="58" cy="32" r="3" fill="#2ecc71" />
          {/* Small signal arcs */}
          <path d="M18 36 Q22 32 20 28" stroke="#2ecc71" strokeWidth="0.8" fill="none" opacity="0.3" />
          <path d="M41 38 Q45 34 43 30" stroke="#2ecc71" strokeWidth="0.8" fill="none" opacity="0.3" />
          <path d="M61 30 Q65 26 63 22" stroke="#2ecc71" strokeWidth="0.8" fill="none" opacity="0.3" />
        </g>
      </svg>
    ),
  },
];

export default function ScalesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="scales" className="relative py-24 sm:py-32 bg-m3-bg-alt" ref={ref}>
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <SatelliteDish className="w-5 h-5 text-m3-accent" />
            <span className="text-xs font-mono text-m3-accent uppercase tracking-widest">
              Tres Escalas de Análisis
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Del sensor al{" "}
            <span className="gradient-text">territorio.</span>
          </h2>
          <p className="text-m3-text-muted text-lg leading-relaxed">
            M3TRIC opera en tres escalas complementarias que integran datos
            desde el punto de medición hasta la visión territorial completa.
          </p>
        </motion.div>

        {/* Vertical scales layout matching brand image */}
        <div className="relative">
          {/* Right bracket connector */}
          <div className="hidden md:block absolute right-0 top-0 bottom-0 w-8">
            <svg viewBox="0 0 30 600" className="w-full h-full" preserveAspectRatio="none">
              <path
                d="M5 10 L20 10 L20 590 L5 590"
                fill="none"
                stroke="#1b4332"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="space-y-0 md:pr-12">
            {scales.map((scale, i) => (
              <motion.div
                key={scale.id}
                initial={{ opacity: 0, x: -30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.2 * i }}
              >
                {/* Dashed separator (between items) */}
                {i > 0 && (
                  <div className="border-t-2 border-dashed border-m3-border my-0" />
                )}

                <div className="flex flex-col md:flex-row items-center gap-8 py-10 px-4 md:px-8">
                  {/* Scale label */}
                  <div className="shrink-0 text-center md:text-left md:w-48">
                    <h3 className="text-2xl sm:text-3xl font-bold">
                      <span style={{ color: scale.color }} className="font-mono">{scale.id}</span>
                      <span className="text-m3-text-muted">: </span>
                      <span className="text-m3-text font-semibold">{scale.label}</span>
                    </h3>
                  </div>

                  {/* Illustration */}
                  <div className="shrink-0 w-48 h-32 md:w-56 md:h-36 rounded-xl bg-m3-surface/50 p-4 flex items-center justify-center">
                    {scale.icon}
                  </div>

                  {/* Description */}
                  <div className="flex-1">
                    <p className="text-m3-text-muted text-sm leading-relaxed">
                      {scale.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
