import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { type Rol, resendCode } from "../services/auth.service";

// Redirige al usuario según su rol
function redirigirPorRol(rol: Rol, navigate: ReturnType<typeof useNavigate>) {
  if (rol === "admin") {
    navigate("/admin");
  } else if (rol === "organizador") {
    navigate("/organizer/dashboard");
  } else if (rol === "miembro") {
    navigate("/user/dashboard");
  }
  else {
    navigate("/");
  }
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login, register, verifyEmail } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [emailToVerify, setEmailToVerify] = useState("");

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
      
      // Si el error sugiere que falta verificación, podríamos mostrar el formulario de verificación
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

    // El sistema ahora permite cualquier correo electrónico. 
    // Los correos @uninorte.edu.co se registrarán como organizadores vía Roble,
    // otros dominios se registrarán como miembros visitantes.

    if (registerPassword !== registerConfirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(registerName, registerEmail, registerPassword);
      
      // Si es un objeto con mensaje (Uninorte)
      if (result && result.mensaje) {
        toast.info(result.mensaje);
        setEmailToVerify(registerEmail);
        setShowVerify(true);
      } else {
        // Si devolvió el usuario (Visitante)
        toast.success("¡Cuenta creada exitosamente!");
        redirigirPorRol(result.rol, navigate);
      }
    } catch (err: unknown) {
      const mensaje = err instanceof Error ? err.message : "Error al registrarse";
      toast.error(mensaje);
      
      // Si el usuario ya existe (409), puede que falte verificar
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

  if (showVerify) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar showSearch={false} />
        <div className="max-w-md mx-auto px-4 py-12">
          <Card>
            <CardHeader>
              <CardTitle>Verifica tu cuenta</CardTitle>
              <CardDescription>
                Ingresa el código que enviamos a {emailToVerify}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verify-code">Código de verificación</Label>
                  <Input
                    id="verify-code"
                    placeholder="Ej. 123456"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    required
                    className="text-center text-2xl tracking-widest"
                  />
                </div>
                <Button type="submit" className="w-full bg-primary" disabled={isLoading}>
                  {isLoading ? "Verificando..." : "Verificar correo"}
                </Button>
                <div className="flex flex-col space-y-2 mt-4">
                  <Button 
                    type="button"
                    variant="outline" 
                    className="w-full" 
                    onClick={handleResendCode}
                  >
                    Reenviar código
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full" 
                    onClick={() => setShowVerify(false)}
                  >
                    Volver al inicio de sesión
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showSearch={false} />

      <div className="max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl mb-2" style={{ fontWeight: 700 }}>
            Bienvenido a UniEventos
          </h1>
          <p className="text-muted-foreground">
            Inicia sesión o crea una cuenta para empezar
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Accede a tu cuenta</CardTitle>
            <CardDescription>
              Inicia sesión con tu cuenta para acceder a UniEventos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Iniciar sesión</TabsTrigger>
                <TabsTrigger value="register">Crear cuenta</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Correo electrónico</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="ejemplo@correo.com"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      required
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Contraseña</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      required
                      className="bg-white"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
                  </Button>

                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                    <p className="mb-2" style={{ fontWeight: 600 }}>
                      Cuentas de prueba (solo desarrollo):
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Organizador: fatima@uninorte.edu.co
                      <br />
                      Admin: admin@uninorte.edu.co
                      <br />
                      Miembro: juan@uninorte.edu.co
                      <br />
                      (Cualquier contraseña funciona)
                    </p>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nombre completo</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Ej. María Gómez"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Correo electrónico</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="ejemplo@correo.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                      className="bg-white"
                    />
                    <p className="text-xs text-muted-foreground">
                      Usa tu correo institucional si eres organizador
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Contraseña</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                      minLength={8}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">
                      Confirmar contraseña
                    </Label>
                    <Input
                      id="register-confirm-password"
                      type="password"
                      placeholder="Repite tu contraseña"
                      value={registerConfirmPassword}
                      onChange={(e) =>
                        setRegisterConfirmPassword(e.target.value)
                      }
                      required
                      minLength={8}
                      className="bg-white"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#1D9E75] hover:bg-[#188c66]"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creando cuenta..." : "Crear cuenta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-accent hover:underline">
            Continuar como invitado
          </Link>
        </div>
      </div>
    </div>
  );
}
