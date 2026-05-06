import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  obtenerUsuario,
  guardarSesion,
  cerrarSesion,
  login as loginService,
  register as registerService,
  type UsuarioAuth,
} from "../app/services/auth.service";

// ── Tipos del contexto ────────────────────────────────────────
interface AuthContextType {
  usuario: UsuarioAuth | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<UsuarioAuth>;
  register: (nombre_completo: string, email: string, password: string) => Promise<UsuarioAuth>;
  logout: () => void;
}

// ── Creación del contexto ─────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null);

// ── Provider ──────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioAuth | null>(null);
  const [isLoading, setIsLoading] = useState(true); // true hasta leer localStorage

  // Al montar: leer localStorage una sola vez de forma asíncrona
  useEffect(() => {
    const u = obtenerUsuario();
    setUsuario(u);
    setIsLoading(false); // ya terminamos de cargar
  }, []);

  // login: llama al servicio, guarda en localStorage y actualiza el estado de React
  const login = async (email: string, password: string): Promise<UsuarioAuth> => {
    const data = await loginService(email, password);
    guardarSesion(data);
    setUsuario(data.usuario);
    return data.usuario;
  };

  // register: llama al servicio, guarda en localStorage y actualiza el estado de React
  const register = async (
    nombre_completo: string,
    email: string,
    password: string
  ): Promise<UsuarioAuth> => {
    const data = await registerService(nombre_completo, email, password);
    guardarSesion(data);
    setUsuario(data.usuario);
    return data.usuario;
  };

  // logout: limpia localStorage y el estado de React
  const logout = () => {
    cerrarSesion();
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook useAuth ──────────────────────────────────────────────
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return ctx;
}
