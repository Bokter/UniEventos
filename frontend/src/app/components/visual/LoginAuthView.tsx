/* @visual-only */
import { Link } from "react-router";
import { motion } from "motion/react";
import { LogIn, ShieldCheck, UserPlus } from "lucide-react";
import type { ReactNode } from "react";
import {
  fadeUp,
  motionVariants,
  staggerContainer,
} from "../../../lib/animations";

const FEATURES = [
  "Eventos en tiempo real",
  "Mapa del campus",
  "AR Viewer",
] as const;

interface LoginAuthViewProps {
  mode: "auth" | "verify";
  activeTab: "signin" | "register";
  onTabChange: (tab: "signin" | "register") => void;
  isLoading: boolean;
  emailToVerify?: string;
  signInForm: ReactNode;
  registerForm: ReactNode;
  verifyForm: ReactNode;
}

function IllustrationPanel() {
  return (
    <div className="login-panel-left hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
      <div className="login-grid-pattern" aria-hidden />
      <div className="login-orb float-orb" aria-hidden />
      <motion.div
        variants={motionVariants(staggerContainer)}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-md"
      >
        <motion.h1 variants={motionVariants(fadeUp)} className="font-display mb-4">
          UniEventos
        </motion.h1>
        <motion.p
          variants={motionVariants(fadeUp)}
          className="font-body italic mb-10"
          style={{ color: "var(--text-secondary)", fontWeight: 300 }}
        >
          Descubre, organiza y vive los eventos de tu comunidad universitaria.
        </motion.p>
        <div className="flex flex-col gap-3">
          {FEATURES.map((f) => (
            <motion.div
              key={f}
              variants={motionVariants(fadeUp)}
              className="glass-panel inline-flex items-center gap-3 px-4 py-2.5 rounded-full w-fit"
            >
              <span
                className="logo-pulse-dot w-2 h-2 rounded-full shrink-0"
                style={{ background: "var(--accent-primary)" }}
              />
              <span className="font-body text-sm" style={{ color: "var(--text-primary)" }}>
                {f}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export function LoginAuthView({
  mode,
  activeTab,
  onTabChange,
  isLoading,
  emailToVerify,
  signInForm,
  registerForm,
  verifyForm,
}: LoginAuthViewProps) {
  if (mode === "verify") {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row bg-[var(--bg-base)]">
        <IllustrationPanel />
        <div className="login-panel-right flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-[420px]">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-6 mx-auto lg:mx-0"
              style={{ background: "var(--accent-glow)" }}
            >
              <ShieldCheck size={28} style={{ color: "var(--accent-primary)" }} />
            </div>
            <h1 className="font-h1 text-center lg:text-left mb-2">Verifica tu cuenta</h1>
            <p className="font-caption text-center lg:text-left mb-8">
              Ingresa el código enviado a{" "}
              <strong style={{ color: "var(--text-primary)" }}>{emailToVerify}</strong>
            </p>
            {verifyForm}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[var(--bg-base)]">
      <IllustrationPanel />
      <div className="login-panel-right flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[420px]">
          <div
            className="flex w-full p-1 mb-8 gap-1 rounded-[10px]"
            style={{ background: "var(--bg-elevated)" }}
          >
            <button
              type="button"
              onClick={() => onTabChange("signin")}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-body text-sm transition-all"
              style={{
                background: activeTab === "signin" ? "var(--bg-overlay)" : "transparent",
                color: activeTab === "signin" ? "var(--text-primary)" : "var(--text-muted)",
                fontWeight: activeTab === "signin" ? 600 : 400,
              }}
            >
              <LogIn size={15} />
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => onTabChange("register")}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-body text-sm transition-all"
              style={{
                background: activeTab === "register" ? "var(--bg-overlay)" : "transparent",
                color: activeTab === "register" ? "var(--text-primary)" : "var(--text-muted)",
                fontWeight: activeTab === "register" ? 600 : 400,
              }}
            >
              <UserPlus size={15} />
              Crear cuenta
            </button>
          </div>

          {activeTab === "signin" ? signInForm : registerForm}

          <div className="text-center mt-6">
            <Link
              to="/"
              className="font-body text-sm hover:underline"
              style={{ color: "var(--text-secondary)" }}
            >
              Continuar como invitado →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

LoginAuthView.displayName = "LoginAuthView";
