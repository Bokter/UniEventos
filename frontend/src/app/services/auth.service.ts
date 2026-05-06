// ============================================================
// auth.service.ts — Servicio de autenticación para UniEventos
// Rama: feat/auth-screens  |  Responsable: Fatima
// ============================================================
// INSTRUCCIONES PARA CONECTAR AL BACKEND (Juan Jose):
//   1. Descomenta el bloque "REAL" de cada función
//   2. Borra el bloque "FAKE" correspondiente
//   3. Asegúrate de que el backend esté corriendo en localhost:3000
// ============================================================

const BASE_URL = 'http://localhost:3000';
import { mockUsers } from '../data/mockData';

// ── Tipos ────────────────────────────────────────────────────
export type Rol = 'miembro' | 'organizador' | 'admin';

export interface UsuarioAuth {
  id: number;
  nombre_completo: string;
  email: string;
  rol: Rol;
}

export interface RespuestaAuth {
  token: string;
  usuario: UsuarioAuth;
}

// ── Helpers de localStorage ──────────────────────────────────
export const guardarSesion = (data: RespuestaAuth) => {
  localStorage.setItem('token', data.token);
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
  // ── REAL (descomentar cuando Juan Jose termine el endpoint) ──
  // const res = await fetch(`${BASE_URL}/auth/login`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email, password }),
  // });
  // if (!res.ok) {
  //   const err = await res.json().catch(() => ({}));
  //   throw new Error(err.message || 'Credenciales incorrectas');
  // }
  // return res.json();

  // ── FAKE (borrar cuando conectes al backend real) ────────────
  await new Promise((r) => setTimeout(r, 800)); // simula delay de red

  // Usuarios de prueba para desarrollo
  const usuariosFake: Record<string, UsuarioAuth> = {
    'fatima@uninorte.edu.co': {
      id: 1,
      nombre_completo: 'Fatima Castro',
      email: 'fatima@uninorte.edu.co',
      rol: 'organizador',
    },
    'admin@uninorte.edu.co': {
      id: 2,
      nombre_completo: 'Admin Uninorte',
      email: 'admin@uninorte.edu.co',
      rol: 'admin',
    },
    'juan@uninorte.edu.co': {
      id: 3,
      nombre_completo: 'Juan Estudiante',
      email: 'juan@uninorte.edu.co',
      rol: 'miembro',
    },
  };

  // Agregar dinámicamente los mockUsers para pruebas de desarrollo
  mockUsers.forEach(mu => {
    let mappedRol: Rol = 'miembro';
    if (mu.role === 'Organizer') mappedRol = 'organizador';
    if (mu.role === 'Admin') mappedRol = 'admin';

    usuariosFake[mu.email] = {
      id: parseInt(mu.id) || Math.floor(Math.random() * 1000) + 10,
      nombre_completo: mu.name,
      email: mu.email,
      rol: mappedRol,
    };
  });

  const usuario = usuariosFake[email];
  if (!usuario) {
    throw new Error('Correo o contraseña incorrectos');
  }

  return {
    token: `fake-token-${usuario.id}-${Date.now()}`,
    usuario,
  };
  // ── FIN FAKE ─────────────────────────────────────────────────
};

// ── Register ─────────────────────────────────────────────────
export const register = async (
  nombre_completo: string,
  email: string,
  password: string
): Promise<RespuestaAuth> => {
  // ── REAL (descomentar cuando Juan Jose termine el endpoint) ──
  // const res = await fetch(`${BASE_URL}/auth/register`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ nombre_completo, email, password }),
  // });
  // if (!res.ok) {
  //   const err = await res.json().catch(() => ({}));
  //   throw new Error(err.message || 'Error al registrarse');
  // }
  // return res.json();

  // ── FAKE (borrar cuando conectes al backend real) ────────────
  await new Promise((r) => setTimeout(r, 800));

  return {
    token: `fake-token-new-${Date.now()}`,
    usuario: {
      id: Math.floor(Math.random() * 1000) + 10,
      nombre_completo,
      email,
      rol: 'miembro',
    },
  };
  // ── FIN FAKE ─────────────────────────────────────────────────
};

// Exportar BASE_URL por si otros servicios lo necesitan
export { BASE_URL };
