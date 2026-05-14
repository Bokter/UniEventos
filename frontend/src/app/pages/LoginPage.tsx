import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { type Rol, resendCode } from "../services/auth.service";
import { LogIn, UserPlus, ShieldCheck } from "lucide-react";

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

  // Estado del formulario de inicio de sesión
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Estado del formulario de registro
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");

  // ─── Manejador de inicio de sesión ──────────────────────────
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

  // ─── Manejador de registro ───────────────────────────────────
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

  // ─── Manejador de verificación ──────────────────────────────
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

  // ─── Pantalla de verificación ───────────────────────────────
  if (showVerify) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e8f5ed] via-[#d4ecdd] to-[#c8e8d4] p-6">
        <div className="bg-white rounded-[20px] shadow-[0_8px_40px_rgba(41,50,65,0.12)] p-8 md:p-10 w-full max-w-[420px] flex flex-col items-center">
          <div style={iconCircle}>
            <ShieldCheck size={28} color="#EE6C4D" />
          </div>
          <h1 style={titleStyle}>Verifica tu cuenta</h1>
          <p style={subtitleStyle}>
            Ingresa el código que enviamos a<br />
            <strong style={{ color: '#293241' }}>{emailToVerify}</strong>
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

  // ─── Pantalla principal de login ────────────────────────────
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-[#e8f5ed] via-[#d4ecdd] to-[#c8e8d4]">
      {/* Panel izquierdo decorativo */}
      <div className="hidden md:flex md:w-[40%] bg-gradient-to-br from-[#293241] to-[#3D5A80] items-center justify-center p-12 relative overflow-hidden">
        <div style={heroContentStyle}>
          <div style={logoBadgeStyle}>UN</div>
          <h1 className="text-white text-[2.2rem] font-extrabold mt-6 mb-3 tracking-tight leading-[1.2]">
            UniEventos
          </h1>
          <p className="text-white/75 text-base font-light leading-[1.7] max-w-[260px]">
            Descubre, organiza y vive los eventos de tu comunidad universitaria.
          </p>
          <div className="mt-10 flex flex-col gap-3">
            {['Eventos en tiempo real', 'Visor AR interactivo', 'Comunidad universitaria'].map(f => (
              <div key={f} className="flex items-center gap-[0.6rem]">
                <div className="w-2 h-2 rounded-full bg-[#A4D4B4]" />
                <span className="text-white/85 text-[0.9rem] font-light">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho con formulario */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="bg-white rounded-[20px] shadow-[0_8px_40px_rgba(41,50,65,0.12)] p-8 md:p-10 w-full max-w-[420px] flex flex-col items-center">
          {/* Tabs */}
          <div style={tabsContainerStyle}>
            <button
              type="button"
              style={activeTab === 'signin' ? activeTabStyle : inactiveTabStyle}
              onClick={() => setActiveTab('signin')}
            >
              <LogIn size={15} style={{ marginRight: 6 }} />
              Iniciar sesión
            </button>
            <button
              type="button"
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
                <Link to="/" style={{ color: '#3D5A80', fontSize: '0.85rem', textDecoration: 'none' }}>
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
                <p style={{ fontSize: '0.75rem', color: '#4a7a5a', marginTop: '0.25rem' }}>
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

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  background: 'linear-gradient(135deg, #e8f5ed 0%, #d4ecdd 50%, #c8e8d4 100%)',
};

const heroPanelStyle: React.CSSProperties = {
  width: '40%',
  background: 'linear-gradient(160deg, #293241 0%, #3D5A80 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '3rem',
  position: 'relative',
  overflow: 'hidden',
};

const heroContentStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
};

const logoBadgeStyle: React.CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: '14px',
  background: '#EE6C4D',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontSize: '1.2rem',
  fontWeight: 800,
  letterSpacing: '0.05em',
};

const formPanelStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
};

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: '20px',
  boxShadow: '0 8px 40px rgba(41, 50, 65, 0.12)',
  padding: '2.5rem',
  width: '100%',
  maxWidth: '420px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0',
};

const iconCircle: React.CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: '50%',
  background: 'rgba(238,108,77,0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '1rem',
};

const tabsContainerStyle: React.CSSProperties = {
  display: 'flex',
  width: '100%',
  background: '#f0faf4',
  borderRadius: '12px',
  padding: '4px',
  marginBottom: '1.5rem',
  gap: '4px',
};

const activeTabStyle: React.CSSProperties = {
  flex: 1,
  padding: '0.6rem 0',
  border: 'none',
  borderRadius: '9px',
  background: '#ffffff',
  color: '#293241',
  fontWeight: 700,
  fontSize: '0.85rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 8px rgba(41,50,65,0.1)',
  fontFamily: "'Outfit', sans-serif",
  transition: 'all 0.2s ease',
};

const inactiveTabStyle: React.CSSProperties = {
  ...activeTabStyle,
  background: 'transparent',
  color: '#4a7a5a',
  boxShadow: 'none',
  fontWeight: 400,
};

const formStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '0',
};

const titleStyle: React.CSSProperties = {
  fontSize: '1.4rem',
  fontWeight: 700,
  color: '#293241',
  marginBottom: '0.25rem',
  letterSpacing: '0.02em',
  textAlign: 'center' as const,
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '0.88rem',
  color: '#4a7a5a',
  fontWeight: 300,
  marginBottom: '1.5rem',
  textAlign: 'center' as const,
  lineHeight: 1.5,
};

const fieldGroup: React.CSSProperties = {
  marginBottom: '1rem',
  width: '100%',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.82rem',
  fontWeight: 700,
  color: '#293241',
  marginBottom: '0.35rem',
  display: 'block',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.65rem 0.9rem',
  border: '1.5px solid rgba(164,212,180,0.5)',
  borderRadius: '10px',
  background: 'rgba(240,250,244,0.6)',
  color: '#293241',
  fontFamily: "'Outfit', sans-serif",
  fontWeight: 300,
  fontSize: '0.95rem',
  outline: 'none',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
};

const btnPrimaryStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  border: 'none',
  borderRadius: '10px',
  background: 'linear-gradient(135deg, #EE6C4D 0%, #e05a3c 100%)',
  color: '#ffffff',
  fontWeight: 700,
  fontSize: '0.95rem',
  cursor: 'pointer',
  marginTop: '0.5rem',
  fontFamily: "'Outfit', sans-serif",
  transition: 'opacity 0.2s ease, transform 0.15s ease',
  letterSpacing: '0.02em',
};

const btnOutlineStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.65rem',
  border: '1.5px solid #A4D4B4',
  borderRadius: '10px',
  background: 'transparent',
  color: '#293241',
  fontWeight: 400,
  fontSize: '0.9rem',
  cursor: 'pointer',
  fontFamily: "'Outfit', sans-serif",
  transition: 'background 0.2s ease',
};

const btnGhostStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem',
  border: 'none',
  borderRadius: '10px',
  background: 'transparent',
  color: '#4a7a5a',
  fontWeight: 400,
  fontSize: '0.87rem',
  cursor: 'pointer',
  fontFamily: "'Outfit', sans-serif",
};
