"use client";

import { ArrowUpRight, Mail } from "lucide-react";
import { M3tricLogoMark } from "@/components/brand/M3tricLogo";
import { getPlatformUrl } from "@/lib/platform";

const footerLinks = {
  Plataforma: [
    { label: "Abrir Plataforma", href: "platform" },
    { label: "Dashboard", href: "platform" },
    { label: "Analítica", href: "platform" },
    { label: "Reportes", href: "platform" },
  ],
  Recursos: [
    { label: "Plataforma", href: "#platform" },
    { label: "Tecnología", href: "#technology" },
    { label: "Casos de Uso", href: "#use-cases" },
    { label: "Contacto", href: "#contact" },
  ],
  Empresa: [
    { label: "Acerca de", href: "#platform" },
    { label: "Contacto", href: "#contact" },
    { label: "Productos", href: "#products" },
    { label: "Escalas", href: "#scales" },
  ],
};

export default function Footer() {
  const platformUrl = getPlatformUrl();

  return (
    <footer className="relative border-t border-m3-border/50 bg-m3-bg-alt">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-1.5 mb-4">
              <M3tricLogoMark size={28} />
              <span className="text-lg font-bold tracking-tight" style={{ color: "#1b4332" }}>
                3TRIC
              </span>
            </div>
            <p className="text-sm text-m3-text-muted leading-relaxed max-w-xs mb-6">
              Analítica espacio-temporal multiescala para toma de decisiones
              territoriales y ambientales.
            </p>
            <div className="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <a
                href={platformUrl}
                className="inline-flex items-center gap-2 rounded-full bg-m3-green-dark px-5 py-2.5 text-sm font-medium text-white hover:bg-m3-green-mid transition-colors"
              >
                Abrir Plataforma
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <a
                href="mailto:contact@m3tric.io"
                className="inline-flex items-center gap-2 rounded-full border border-m3-border px-5 py-2.5 text-sm text-m3-text-muted hover:text-m3-green-dark hover:border-m3-accent/30 transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                Solicitar Demo
              </a>
            </div>
            <p className="text-xs text-m3-text-dim">
              Desarrollado en la Universidad EAFIT, Medellín, Colombia
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-mono text-m3-text-muted uppercase tracking-widest mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href === "platform" ? platformUrl : link.href}
                      className="text-sm text-m3-text-dim hover:text-m3-accent transition-colors duration-300"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-m3-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-m3-text-dim">
            &copy; {new Date().getFullYear()} M3TRIC. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-m3-text-dim hover:text-m3-accent transition-colors">
              Política de Privacidad
            </a>
            <a href="#" className="text-xs text-m3-text-dim hover:text-m3-accent transition-colors">
              Términos de Servicio
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
