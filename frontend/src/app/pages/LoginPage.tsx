/* @logic — do not touch */
import { useState } from "react";
import { useNavigate } from "react-router";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { type Rol, resendCode } from "../services/auth.service";
import { LoginAuthView } from "../components/visual/LoginAuthView";

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

  const inputClass = "uni-input mt-0 border-0 focus:ring-0 h-auto";

  const signInForm = (
    <form onSubmit={handleSignIn} className="w-full space-y-4">
      <h2 className="font-h2 mb-1">Bienvenido de vuelta</h2>
      <p className="font-caption mb-6">Ingresa tus credenciales para continuar</p>
      <div>
        <Label htmlFor="signin-email" className="uni-label">Correo electrónico</Label>
        <Input
          id="signin-email"
          type="email"
          placeholder="ejemplo@correo.com"
          value={signInEmail}
          onChange={(e) => setSignInEmail(e.target.value)}
          required
          className={inputClass}
        />
      </div>
      <div>
        <Label htmlFor="signin-password" className="uni-label">Contraseña</Label>
        <Input
          id="signin-password"
          type="password"
          placeholder="••••••••"
          value={signInPassword}
          onChange={(e) => setSignInPassword(e.target.value)}
          required
          className={inputClass}
        />
      </div>
      <button type="submit" disabled={isLoading} className="uni-btn-primary">
        {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
      </button>
    </form>
  );

  const registerForm = (
    <form onSubmit={handleRegister} className="w-full space-y-4">
      <h2 className="font-h2 mb-1">Crea tu cuenta</h2>
      <p className="font-caption mb-6">Únete a la comunidad UniEventos</p>
      <div>
        <Label htmlFor="register-name" className="uni-label">Nombre completo</Label>
        <Input id="register-name" type="text" placeholder="Ej. María Gómez" value={registerName} onChange={(e) => setRegisterName(e.target.value)} required className={inputClass} />
      </div>
      <div>
        <Label htmlFor="register-email" className="uni-label">Correo electrónico</Label>
        <Input id="register-email" type="email" placeholder="ejemplo@correo.com" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} required className={inputClass} />
        <p className="font-caption mt-1" style={{ fontSize: "var(--text-xs)" }}>Usa tu correo institucional si eres organizador</p>
      </div>
      <div>
        <Label htmlFor="register-password" className="uni-label">Contraseña</Label>
        <Input id="register-password" type="password" placeholder="Mínimo 8 caracteres" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} required minLength={8} className={inputClass} />
      </div>
      <div>
        <Label htmlFor="register-confirm-password" className="uni-label">Confirmar contraseña</Label>
        <Input id="register-confirm-password" type="password" placeholder="Repite tu contraseña" value={registerConfirmPassword} onChange={(e) => setRegisterConfirmPassword(e.target.value)} required minLength={8} className={inputClass} />
      </div>
      <button type="submit" disabled={isLoading} className="uni-btn-primary">
        {isLoading ? "Creando cuenta..." : "Crear cuenta"}
      </button>
    </form>
  );

  const verifyForm = (
    <form onSubmit={handleVerify} className="w-full space-y-4">
      <div>
        <Label htmlFor="verify-code" className="uni-label">Código de verificación</Label>
        <Input
          id="verify-code"
          placeholder="Ej. 123456"
          value={verifyCode}
          onChange={(e) => setVerifyCode(e.target.value)}
          required
          className={`${inputClass} text-center text-2xl tracking-[0.3em]`}
        />
      </div>
      <button type="submit" disabled={isLoading} className="uni-btn-primary">
        {isLoading ? "Verificando..." : "Verificar correo"}
      </button>
      <button type="button" onClick={handleResendCode} className="uni-btn-outline w-full">
        Reenviar código
      </button>
      <button type="button" onClick={() => setShowVerify(false)} className="uni-btn-ghost w-full">
        Volver al inicio de sesión
      </button>
    </form>
  );

  return (
    <LoginAuthView
      mode={showVerify ? "verify" : "auth"}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isLoading={isLoading}
      emailToVerify={emailToVerify}
      signInForm={signInForm}
      registerForm={registerForm}
      verifyForm={verifyForm}
    />
  );
}
