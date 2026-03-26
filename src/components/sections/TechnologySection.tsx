"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const techStack = [
  {
    category: "Backend",
    items: [
      { name: "Python 3.11+", desc: "Runtime async-nativo" },
      { name: "FastAPI", desc: "API REST de alto rendimiento" },
      { name: "SQLAlchemy 2.0", desc: "ORM async con GeoAlchemy2" },
      { name: "Pydantic v2", desc: "Validación de datos y esquemas" },
      { name: "Alembic", desc: "Migraciones de base de datos" },
    ],
    accentColor: "#2ecc71",
  },
  {
    category: "Datos y Analítica",
    items: [
      { name: "PostgreSQL + PostGIS", desc: "Motor de BD geoespacial" },
      { name: "Redis", desc: "Caché y pub/sub en tiempo real" },
      { name: "GeoPandas + Shapely", desc: "Procesamiento de datos espaciales" },
      { name: "SciPy + scikit-learn", desc: "Análisis estadístico y ML" },
      { name: "Rasterio", desc: "I/O de datos ráster" },
    ],
    accentColor: "#3a8a5c",
  },
  {
    category: "Frontend",
    items: [
      { name: "React 18 + TypeScript", desc: "Componentes tipados" },
      { name: "Mapbox GL JS", desc: "Mapas 3D con WebGL" },
      { name: "ECharts", desc: "Visualización de series temporales" },
      { name: "Zustand", desc: "Gestión de estado ligera" },
      { name: "Tailwind CSS", desc: "Estilos utility-first" },
    ],
    accentColor: "#2980b9",
  },
  {
    category: "Infraestructura",
    items: [
      { name: "Docker Compose", desc: "Orquestación de contenedores" },
      { name: "Nginx", desc: "Proxy inverso" },
      { name: "AWS ECS Fargate", desc: "Contenedores serverless" },
      { name: "CloudFront", desc: "CDN de distribución global" },
      { name: "S3", desc: "Almacenamiento de objetos" },
    ],
    accentColor: "#f39c12",
  },
];

export default function TechnologySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="technology" className="relative py-32 sm:py-40 bg-m3-bg-alt" ref={ref}>
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
            Tecnología
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Stack de{" "}
            <span className="gradient-text">nivel empresarial.</span>
          </h2>
          <p className="text-m3-text-muted text-lg leading-relaxed">
            Cada capa elegida por confiabilidad, rendimiento y
            mantenibilidad a largo plazo.
          </p>
        </motion.div>

        {/* Tech grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          {techStack.map((group, gi) => (
            <motion.div
              key={group.category}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 * gi }}
              className="glass-card rounded-2xl p-6 sm:p-7"
            >
              <h3
                className="font-mono text-xs uppercase tracking-widest mb-5"
                style={{ color: group.accentColor }}
              >
                {group.category}
              </h3>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <div key={item.name} className="flex items-start gap-3">
                    <div
                      className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: group.accentColor }}
                    />
                    <div>
                      <div className="text-sm font-medium">{item.name}</div>
                      <div className="text-xs text-m3-text-muted">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
