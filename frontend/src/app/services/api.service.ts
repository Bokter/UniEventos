// ============================================================
// api.service.ts — Servicio centralizado de llamadas al backend
// BASE_URL: http://localhost:3000
// ============================================================

import { obtenerToken } from './auth.service';

const BASE_URL = 'http://localhost:3000';

// Helper: construye headers con Authorization si hay token
function buildHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = obtenerToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

// Helper: lanza error con mensaje legible si la respuesta no es OK
async function handleResponse<T = any>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message || `Error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Eventos ──────────────────────────────────────────────────
export const eventosApi = {
  getAll: () =>
    fetch(`${BASE_URL}/eventos`, { headers: buildHeaders() }).then(handleResponse),

  getPendientes: () =>
    fetch(`${BASE_URL}/eventos/pendientes`, { headers: buildHeaders() }).then(handleResponse),

  getMisEventos: () =>
    fetch(`${BASE_URL}/eventos/mis-eventos`, { headers: buildHeaders() }).then(handleResponse),

  getById: (id: number | string) =>
    fetch(`${BASE_URL}/eventos/${id}`, { headers: buildHeaders() }).then(handleResponse),

  aprobar: (id: number | string) =>
    fetch(`${BASE_URL}/eventos/${id}/aprobar`, {
      method: 'PATCH',
      headers: buildHeaders(),
    }).then(handleResponse),

  rechazar: (id: number | string, observacion: string) =>
    fetch(`${BASE_URL}/eventos/${id}/rechazar`, {
      method: 'PATCH',
      headers: buildHeaders(),
      body: JSON.stringify({ observacion }),
    }).then(handleResponse),

  cancelar: (id: number | string) =>
    fetch(`${BASE_URL}/eventos/${id}/cancelar`, {
      method: 'PATCH',
      headers: buildHeaders(),
    }).then(handleResponse),

  enviarRevision: (id: number | string) =>
    fetch(`${BASE_URL}/eventos/${id}/enviar`, {
      method: 'PATCH',
      headers: buildHeaders(),
    }).then(handleResponse),

  create: (body: Record<string, unknown>) =>
    fetch(`${BASE_URL}/eventos`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  update: (id: number | string, body: Record<string, unknown>) =>
    fetch(`${BASE_URL}/eventos/${id}`, {
      method: 'PUT',
      headers: buildHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),
};

// ── Usuarios ─────────────────────────────────────────────────
export const usuariosApi = {
  getAll: () =>
    fetch(`${BASE_URL}/usuarios`, { headers: buildHeaders() }).then(handleResponse),

  activar: (id: number | string) =>
    fetch(`${BASE_URL}/usuarios/${id}/activar`, {
      method: 'PATCH',
      headers: buildHeaders(),
    }).then(handleResponse),

  desactivar: (id: number | string) =>
    fetch(`${BASE_URL}/usuarios/${id}/desactivar`, {
      method: 'PATCH',
      headers: buildHeaders(),
    }).then(handleResponse),

  cambiarRol: (id: number | string, rol: string) =>
    fetch(`${BASE_URL}/usuarios/${id}/rol`, {
      method: 'PATCH',
      headers: buildHeaders(),
      body: JSON.stringify({ rol }),
    }).then(handleResponse),
};

// ── Categorías ────────────────────────────────────────────────
export const categoriasApi = {
  getAll: () =>
    fetch(`${BASE_URL}/categorias`, { headers: buildHeaders() }).then(handleResponse),

  getAllAdmin: () =>
    fetch(`${BASE_URL}/categorias/todas`, { headers: buildHeaders() }).then(handleResponse),

  create: (nombre: string) =>
    fetch(`${BASE_URL}/categorias`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ nombre }),
    }).then(handleResponse),

  update: (id: number | string, nombre?: string, activa?: boolean) =>
    fetch(`${BASE_URL}/categorias/${id}`, {
      method: 'PUT',
      headers: buildHeaders(),
      body: JSON.stringify({ ...(nombre !== undefined && { nombre }), ...(activa !== undefined && { activa }) }),
    }).then(handleResponse),
};

// ── Lugares ──────────────────────────────────────────────────
export const lugaresApi = {
  getAll: () =>
    fetch(`${BASE_URL}/lugares`, { headers: buildHeaders() }).then(handleResponse),

  create: (body: { nombre: string; descripcion?: string; latitud?: number; longitud?: number }) =>
    fetch(`${BASE_URL}/lugares`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),
};

// ── Favoritos ────────────────────────────────────────────────
export const favoritosApi = {
  getAll: () =>
    fetch(`${BASE_URL}/favoritos`, { headers: buildHeaders() }).then(handleResponse),

  add: (eventoId: number | string) =>
    fetch(`${BASE_URL}/favoritos/${eventoId}`, {
      method: 'POST',
      headers: buildHeaders(),
    }).then(handleResponse),

  remove: (eventoId: number | string) =>
    fetch(`${BASE_URL}/favoritos/${eventoId}`, {
      method: 'DELETE',
      headers: buildHeaders(),
    }).then(handleResponse),
};
