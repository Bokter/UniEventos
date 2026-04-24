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
import { type Rol } from "../services/auth.service";

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
  const { login, register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

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
      const mensaje =
        err instanceof Error ? err.message : "Error al iniciar sesión";
      toast.error(mensaje);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Manejador de registro ───────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar correo institucional
    if (!registerEmail.endsWith("@uninorte.edu.co")) {
      toast.error("Debes usar tu correo institucional (@uninorte.edu.co)");
      return;
    }

    // Validar contraseñas
    if (registerPassword !== registerConfirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (registerPassword.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      const usuario = await register(registerName, registerEmail, registerPassword);
      toast.success("¡Cuenta creada exitosamente! Revisa tu correo para verificar tu cuenta.");
      redirigirPorRol(usuario.rol, navigate);
    } catch (err: unknown) {
      const mensaje =
        err instanceof Error ? err.message : "Error al registrarse";
      toast.error(mensaje);
    } finally {
      setIsLoading(false);
    }
  };

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
              Usa tu correo institucional Uninorte para acceder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Iniciar sesión</TabsTrigger>
                <TabsTrigger value="register">Crear cuenta</TabsTrigger>
              </TabsList>

              {/* ── Pestaña: Iniciar Sesión ──────────────────── */}
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Correo institucional</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="tu.nombre@uninorte.edu.co"
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

                  {/* Cuentas de prueba — SOLO PARA DESARROLLO, borrar antes de producción */}
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

              {/* ── Pestaña: Registro ────────────────────────── */}
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
                    <Label htmlFor="register-email">Correo institucional</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="tu.nombre@uninorte.edu.co"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                      className="bg-white"
                    />
                    <p className="text-xs text-muted-foreground">
                      Debe terminar en @uninorte.edu.co
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
