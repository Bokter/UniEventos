/* @visual-only */
import { Link } from "react-router";
import { motion } from "motion/react";
import { fadeIn, motionVariants } from "../../../lib/animations";

export function SiteFooter() {
  return (
    <motion.footer
      variants={motionVariants(fadeIn)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="mt-auto border-t"
      style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="logo-pulse-dot w-2 h-2 rounded-full" style={{ background: "var(--accent-primary)" }} />
            <span className="font-h2" style={{ fontWeight: 700 }}>UniEventos</span>
          </div>
          <p className="font-caption max-w-xs">
            La plataforma universitaria para descubrir, asistir y organizar eventos en tu campus.
          </p>
        </div>

        <div>
          <h4 className="font-h3 mb-4">Explorar</h4>
          <ul className="space-y-2 font-body text-sm">
            <li>
              <Link to="/" className="font-caption hover:underline" style={{ color: "var(--text-secondary)" }}>
                Inicio
              </Link>
            </li>
            <li>
              <Link to="/map" className="font-caption hover:underline" style={{ color: "var(--text-secondary)" }}>
                Mapa de eventos
              </Link>
            </li>
            <li>
              <Link to="/login" className="font-caption hover:underline" style={{ color: "var(--text-secondary)" }}>
                Iniciar sesión
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-h3 mb-4">Equipo</h4>
          <p className="font-caption leading-relaxed">
            Desarrollado por el equipo UniEventos — proyecto académico de eventos universitarios.
          </p>
          <p className="font-data mt-4 opacity-60" style={{ fontSize: "0.75rem" }}>
            © {new Date().getFullYear()} UniEventos
          </p>
        </div>
      </div>
    </motion.footer>
  );
}

SiteFooter.displayName = "SiteFooter";
