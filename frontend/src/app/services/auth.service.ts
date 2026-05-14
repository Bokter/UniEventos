// ============================================================
// auth.service.ts — Servicio de autenticación para UniEventos
// ============================================================

const BASE_URL = 'https://unieventos-s25a.onrender.com';

// ── Tipos ────────────────────────────────────────────────────
export type Rol = 'miembro' | 'organizador' | 'admin';

export interface UsuarioAuth {
  id: number;
  nombre_completo: string;
  email: string;
  rol: Rol;
}

export interface RespuestaAuth {
  access_token: string;
  usuario: UsuarioAuth;
}

// ── Helpers de localStorage ──────────────────────────────────
export const guardarSesion = (data: RespuestaAuth) => {
  localStorage.setItem('token', data.access_token);
  localStorage.setItem('usuario', JSON.stringify(data.usuario));
};

export const obtenerUsuario = (): UsuarioAuth | null => {
  const raw = localStorage.getItem('usuario');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UsuarioAuth;
  } catch {
    return null;
  }
};

export const obtenerToken = (): string | null => {
  return localStorage.getItem('token');
};

export const cerrarSesion = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
};

export const estaAutenticado = (): boolean => {
  return !!obtenerToken();
};

// ── Login ────────────────────────────────────────────────────
export const login = async (
  email: string,
  password: string
): Promise<RespuestaAuth> => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message || 'Credenciales incorrectas o cuenta no verificada');
  }
  return res.json();
};

// ── Register ─────────────────────────────────────────────────
export const register = async (
  nombre_completo: string,
  email: string,
  password: string
): Promise<any> => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre_completo, email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message || 'Error al registrarse');
  }

  return res.json(); // Ahora todos los registros devuelven { mensaje: "..." }
};

// ── Verify Email ─────────────────────────────────────────────
export const verifyEmail = async (email: string, code: string): Promise<{ mensaje: string }> => {
  const res = await fetch(`${BASE_URL}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message || 'Código de verificación inválido');
  }

  return res.json();
};

// ── Resend Code ──────────────────────────────────────────────
export const resendCode = async (email: string): Promise<{ mensaje: string }> => {
  const res = await fetch(`${BASE_URL}/auth/resend-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message || 'No se pudo reenviar el código');
  }

  return res.json();
};

// Exportar BASE_URL por si otros servicios lo necesitan
export { BASE_URL };
