import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { type Rol, resendCode } from "../services/auth.service";
import { LogIn, UserPlus, ShieldCheck, Sparkles } from "lucide-react";

// Redirige al usuario según su rol con fade-out
function redirigirPorRol(rol: Rol, navigate: ReturnType<typeof useNavigate>) {
  document.body.style.transition = 'opacity 0.4s ease';
  document.body.style.opacity = '0';
  setTimeout(() => {
    if (rol === "admin") {
      navigate("/admin");
    } else if (rol === "organizador") {
      navigate("/organizer/dashboard");
    } else if (rol === "miembro") {
      navigate("/user/dashboard");
    } else {
      navigate("/");
    }
    setTimeout(() => { document.body.style.opacity = '1'; }, 50);
  }, 420);
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login, register, verifyEmail } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [emailToVerify, setEmailToVerify] = useState("");
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');

  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const usuario = await login(signInEmail, signInPassword);
      toast.success(`¡Bienvenido/a, ${usuario.nombre_completo}!`);
      redirigirPorRol(usuario.rol, navigate);
    } catch (err: unknown) {
      const mensaje = err instanceof Error ? err.message : "Error al iniciar sesión";
      toast.error(mensaje);
      if (mensaje.toLowerCase().includes("verificar") || mensaje.toLowerCase().includes("código")) {
        setEmailToVerify(signInEmail);
        setShowVerify(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerPassword !== registerConfirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setIsLoading(true);
    try {
      const result = await register(registerName, registerEmail, registerPassword);
      if (result && result.mensaje) {
        toast.info(result.mensaje);
        setEmailToVerify(registerEmail);
        setShowVerify(true);
      } else {
        toast.success("¡Cuenta creada exitosamente!");
        redirigirPorRol(result.rol, navigate);
      }
    } catch (err: unknown) {
      const mensaje = err instanceof Error ? err.message : "Error al registrarse";
      toast.error(mensaje);
      if (mensaje.includes("ya está registrado") || mensaje.includes("conflict")) {
        setEmailToVerify(registerEmail);
        setShowVerify(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await verifyEmail(emailToVerify, verifyCode);
      toast.success("¡Correo verificado con éxito! Ya puedes iniciar sesión.");
      setShowVerify(false);
      setSignInEmail(emailToVerify);
      setActiveTab('signin');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al verificar código");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      toast.info("Solicitando nuevo código...");
      await resendCode(emailToVerify);
      toast.success("Se ha enviado un nuevo código a tu correo.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al reenviar código");
    }
  };

  // Pantalla de verificación
  if (showVerify) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6"
        style={{ background: 'linear-gradient(160deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)' }}>
        <div className="rounded-xl p-8 md:p-10 w-full max-w-[420px] flex flex-col items-center"
          style={{ background: '#1E293B', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
            style={{ background: 'rgba(124, 58, 237, 0.15)' }}>
            <ShieldCheck size={28} style={{ color: '#A78BFA' }} />
          </div>
          <h1 style={titleStyle}>Verifica tu cuenta</h1>
          <p style={subtitleStyle}>
            Ingresa el código que enviamos a<br />
            <strong style={{ color: '#F8FAFC' }}>{emailToVerify}</strong>
          </p>
          <form onSubmit={handleVerify} className="w-full">
            <div style={fieldGroup}>
              <Label htmlFor="verify-code" style={labelStyle}>Código de verificación</Label>
              <Input
                id="verify-code"
                placeholder="Ej. 123456"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                required
                className="text-center text-2xl tracking-[0.3em] h-14"
                style={inputStyle}
              />
            </div>
            <button type="submit" disabled={isLoading} style={btnPrimaryStyle}>
              {isLoading ? "Verificando..." : "Verificar correo"}
            </button>
            <div className="flex flex-col gap-2 mt-3">
              <button type="button" onClick={handleResendCode} style={btnOutlineStyle}>
                Reenviar código
              </button>
              <button type="button" onClick={() => setShowVerify(false)} style={btnGhostStyle}>
                Volver al inicio de sesión
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row"
      style={{ background: '#0F172A' }}>
      {/* Panel izquierdo decorativo */}
      <div className="hidden md:flex md:w-[45%] items-center justify-center p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0F172A 0%, #1E293B 100%)' }}>
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-30"
            style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)' }} />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #F43F5E 0%, transparent 70%)' }} />
        </div>

        <div className="relative z-10 flex flex-col items-start">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #F43F5E 100%)' }}>
            <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '1.2rem' }}>UN</span>
          </div>
          <h1 className="text-4xl mb-3 gradient-text-violet-rose"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, letterSpacing: '-0.02em' }}>
            UniEventos
          </h1>
          <p className="text-base leading-relaxed max-w-[280px] mb-10"
            style={{ color: '#94A3B8', fontWeight: 400 }}>
            Descubre, organiza y vive los eventos de tu comunidad universitaria.
          </p>
          <div className="flex flex-col gap-4">
            {[
              { icon: '🎯', text: 'Eventos en tiempo real' },
              { icon: '🥽', text: 'Visor AR interactivo' },
              { icon: '🎓', text: 'Comunidad universitaria' }
            ].map(f => (
              <div key={f.text} className="flex items-center gap-3">
                <span className="text-lg">{f.icon}</span>
                <span style={{ color: '#F8FAFC', fontSize: '0.95rem', fontWeight: 400 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho con formulario */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12"
        style={{ background: 'linear-gradient(160deg, #1E293B 0%, #0F172A 100%)' }}>
        <div className="rounded-xl p-8 md:p-10 w-full max-w-[420px] flex flex-col items-center"
          style={{ background: '#1E293B', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
          {/* Tabs */}
          <div className="flex w-full rounded-lg p-1 mb-6 gap-1"
            style={{ background: 'rgba(15, 23, 42, 0.6)' }}>
            <button
              type="button"
              className="flex-1 py-2.5 rounded-md text-sm flex items-center justify-center transition-all"
              style={activeTab === 'signin' ? activeTabStyle : inactiveTabStyle}
              onClick={() => setActiveTab('signin')}
            >
              <LogIn size={15} style={{ marginRight: 6 }} />
              Iniciar sesión
            </button>
            <button
              type="button"
              className="flex-1 py-2.5 rounded-md text-sm flex items-center justify-center transition-all"
              style={activeTab === 'register' ? activeTabStyle : inactiveTabStyle}
              onClick={() => setActiveTab('register')}
            >
              <UserPlus size={15} style={{ marginRight: 6 }} />
              Crear cuenta
            </button>
          </div>

          {/* Login Form */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} style={formStyle}>
              <h2 style={titleStyle}>Bienvenido de vuelta</h2>
              <p style={subtitleStyle}>Ingresa tus credenciales para continuar</p>
              <div style={fieldGroup}>
                <Label htmlFor="signin-email" style={labelStyle}>Correo electrónico</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
              <div style={fieldGroup}>
                <Label htmlFor="signin-password" style={labelStyle}>Contraseña</Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="••••••••"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
              <button type="submit" disabled={isLoading} style={btnPrimaryStyle}>
                {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
              </button>
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <Link to="/" style={{ color: '#60A5FA', fontSize: '0.85rem', textDecoration: 'none' }}>
                  Continuar como invitado →
                </Link>
              </div>
            </form>
          )}

          {/* Register Form */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} style={formStyle}>
              <h2 style={titleStyle}>Crea tu cuenta</h2>
              <p style={subtitleStyle}>Únete a la comunidad UniEventos</p>
              <div style={fieldGroup}>
                <Label htmlFor="register-name" style={labelStyle}>Nombre completo</Label>
                <Input
                  id="register-name"
                  type="text"
                  placeholder="Ej. María Gómez"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
              <div style={fieldGroup}>
                <Label htmlFor="register-email" style={labelStyle}>Correo electrónico</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                  style={inputStyle}
                />
                <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
                  Usa tu correo institucional si eres organizador
                </p>
              </div>
              <div style={fieldGroup}>
                <Label htmlFor="register-password" style={labelStyle}>Contraseña</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                  minLength={8}
                  style={inputStyle}
                />
              </div>
              <div style={fieldGroup}>
                <Label htmlFor="register-confirm-password" style={labelStyle}>Confirmar contraseña</Label>
                <Input
                  id="register-confirm-password"
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  style={inputStyle}
                />
              </div>
              <button type="submit" disabled={isLoading} style={btnPrimaryStyle}>
                {isLoading ? "Creando cuenta..." : "Crear cuenta"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Estilos inline ─────────────────────────────────────────────

const activeTabStyle: React.CSSProperties = {
  background: 'rgba(124, 58, 237, 0.2)',
  color: '#A78BFA',
  fontWeight: 600,
  fontFamily: "'Outfit', sans-serif",
};

const inactiveTabStyle: React.CSSProperties = {
  background: 'transparent',
  color: '#64748B',
  fontWeight: 400,
  fontFamily: "'Outfit', sans-serif",
};

const formStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '0',
};

const titleStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 700,
  color: '#F8FAFC',
  marginBottom: '0.25rem',
  letterSpacing: '-0.01em',
  textAlign: 'center' as const,
  fontFamily: "'Space Grotesk', sans-serif",
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  color: '#94A3B8',
  fontWeight: 400,
  marginBottom: '1.5rem',
  textAlign: 'center' as const,
  lineHeight: 1.5,
};

const fieldGroup: React.CSSProperties = {
  marginBottom: '1rem',
  width: '100%',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  fontWeight: 600,
  color: '#F8FAFC',
  marginBottom: '0.35rem',
  display: 'block',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  border: '1px solid rgba(148, 163, 184, 0.15)',
  borderRadius: '0.75rem',
  background: 'rgba(30, 41, 59, 0.6)',
  color: '#F8FAFC',
  fontFamily: "'Outfit', sans-serif",
  fontWeight: 400,
  fontSize: '0.95rem',
  outline: 'none',
};

const btnPrimaryStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.85rem',
  border: 'none',
  borderRadius: '0.75rem',
  background: 'linear-gradient(135deg, #7C3AED 0%, #F43F5E 100%)',
  color: '#FFFFFF',
  fontWeight: 600,
  fontSize: '0.95rem',
  cursor: 'pointer',
  marginTop: '0.5rem',
  fontFamily: "'Outfit', sans-serif",
  letterSpacing: '0.01em',
};

const btnOutlineStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  border: '1px solid rgba(30, 64, 175, 0.4)',
  borderRadius: '0.75rem',
  background: 'rgba(30, 64, 175, 0.1)',
  color: '#60A5FA',
  fontWeight: 500,
  fontSize: '0.9rem',
  cursor: 'pointer',
  fontFamily: "'Outfit', sans-serif",
};

const btnGhostStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem',
  border: 'none',
  borderRadius: '0.75rem',
  background: 'transparent',
  color: '#64748B',
  fontWeight: 400,
  fontSize: '0.87rem',
  cursor: 'pointer',
  fontFamily: "'Outfit', sans-serif",
};
