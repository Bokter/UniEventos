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
      className="mt-auto"
      style={{ background: "var(--color-footer, #1a2233)" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span
              className="logo-pulse-dot w-2 h-2 rounded-full"
              style={{ background: "#EE6C4D" }}
            />
            <span className="font-h2 text-[var(--color-cyan)]">UniEventos</span>
          </div>
          <p className="font-caption text-[var(--color-gray)] max-w-xs">
            La plataforma universitaria para descubrir, asistir y organizar eventos en tu campus.
          </p>
        </div>

        <div>
          <h4 className="font-h3 text-[var(--color-cyan)] mb-4">Explorar</h4>
          <ul className="space-y-2 font-body text-sm">
            <li>
              <Link to="/" className="text-[var(--color-gray)] hover:text-[var(--color-orange)] transition-colors">
                Inicio
              </Link>
            </li>
            <li>
              <Link to="/map" className="text-[var(--color-gray)] hover:text-[var(--color-orange)] transition-colors">
                Mapa de eventos
              </Link>
            </li>
            <li>
              <Link to="/login" className="text-[var(--color-gray)] hover:text-[var(--color-orange)] transition-colors">
                Iniciar sesión
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-h3 text-[var(--color-cyan)] mb-4">Equipo</h4>
          <p className="font-caption text-[var(--color-gray)] leading-relaxed">
            Desarrollado por el equipo UniEventos — proyecto académico de eventos universitarios.
          </p>
          <p className="font-data text-[0.75rem] text-[var(--color-gray)] mt-4 opacity-70">
            © {new Date().getFullYear()} UniEventos
          </p>
        </div>
      </div>
    </motion.footer>
  );
}

SiteFooter.displayName = "SiteFooter";
