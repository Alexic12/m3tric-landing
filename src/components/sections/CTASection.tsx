"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, ArrowUpRight, Rocket, Mail } from "lucide-react";
import { getPlatformUrl } from "@/lib/platform";

export default function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const platformUrl = getPlatformUrl();

  return (
    <section id="contact" className="relative py-32 sm:py-40" ref={ref}>
      <div className="glow-line mb-32" />

      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden bg-gradient-to-br from-m3-green-dark to-m3-green-mid"
        >
          {/* Background glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-white/5 blur-[120px] rounded-full" />

          <div className="relative z-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Rocket className="w-5 h-5 text-m3-green-light" />
              <span className="text-xs font-mono text-m3-green-light uppercase tracking-widest">
                Comienza Ahora
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-white">
              ¿Listo para ver tus datos{" "}
              <span className="text-m3-accent">a toda escala?</span>
            </h2>
            <p className="text-white/70 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
              Solicita una demo para explorar cómo M3TRIC puede transformar tus
              datos ambientales en inteligencia territorial accionable.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={platformUrl}
                className="group relative inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-m3-green-dark hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all duration-500"
              >
                Abrir Plataforma
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5" />
              </a>
              <a
                href="mailto:contact@m3tric.io"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-4 text-sm text-white/80 hover:text-white hover:border-white/50 transition-all duration-300"
              >
                Solicitar Demo
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="mailto:info@m3tric.io"
                className="inline-flex items-center gap-2 rounded-full text-sm text-white/70 hover:text-white transition-all duration-300"
              >
                <Mail className="w-4 h-4" />
                Contáctanos
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
