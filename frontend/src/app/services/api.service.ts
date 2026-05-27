// ============================================================
// api.service.ts — Servicio centralizado de llamadas al backend
// BASE_URL: Localhost or Environment Variable
// ============================================================

import { obtenerToken } from './auth.service';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://unieventos-s25a.onrender.com';

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
    console.error(`API Error [${res.status}] ${res.url}:`, err);
    throw new Error((err as any).message || `Error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// Helper para reintentos en caso de errores de red (como ERR_EMPTY_RESPONSE)
async function fetchWithRetry(url: string, options?: RequestInit, retries = 2): Promise<Response> {
  try {
    const response = await fetch(url, options);
    // Si el servidor responde pero con un error de red (poco común en fetch, pero por si acaso)
    return response;
  } catch (error) {
    if (retries > 0) {
      console.warn(`Error de red detectado, reintentando... (${retries} intentos restantes)`);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Esperar 1.5s
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

// ── Eventos ──────────────────────────────────────────────────
export const eventosApi = {
  getAll: (categoriaId?: number) => {
    const url = new URL(`${BASE_URL}/eventos`);
    if (categoriaId) url.searchParams.append('categoria', String(categoriaId));
    return fetchWithRetry(url.toString(), { headers: buildHeaders() }).then(handleResponse);
  },

  getPendientes: () =>
    fetchWithRetry(`${BASE_URL}/eventos/pendientes`, { headers: buildHeaders() }).then(handleResponse),

  getMisEventos: () =>
    fetchWithRetry(`${BASE_URL}/eventos/mis-eventos`, { headers: buildHeaders() }).then(handleResponse),

  getById: (id: number | string) =>
    fetchWithRetry(`${BASE_URL}/eventos/${id}`, { headers: buildHeaders() }).then(handleResponse),

  aprobar: (id: number | string) =>
    fetchWithRetry(`${BASE_URL}/eventos/${id}/aprobar`, {
      method: 'PATCH',
      headers: buildHeaders(),
    }).then(handleResponse),

  rechazar: (id: number | string, observacion: string) =>
    fetchWithRetry(`${BASE_URL}/eventos/${id}/rechazar`, {
      method: 'PATCH',
      headers: buildHeaders(),
      body: JSON.stringify({ observacion }),
    }).then(handleResponse),

  cancelar: (id: number | string) =>
    fetchWithRetry(`${BASE_URL}/eventos/${id}/cancelar`, {
      method: 'PATCH',
      headers: buildHeaders(),
    }).then(handleResponse),

  iniciarStream: (id: number | string) =>
    fetchWithRetry(`${BASE_URL}/eventos/${id}/stream`, {
      method: 'POST',
      headers: buildHeaders(),
    }).then(handleResponse),

  obtenerTokenStream: (id: number | string) =>
    fetchWithRetry(`${BASE_URL}/eventos/${id}/stream/token`, {
      method: 'GET',
      headers: buildHeaders(),
    }).then(handleResponse),

  actualizarEstadoStream: (id: number | string, estado: 'idle' | 'live' | 'ended', hlsUrl?: string | null) =>
    fetchWithRetry(`${BASE_URL}/eventos/${id}/stream/estado`, {
      method: 'PUT',
      headers: buildHeaders(),
      body: JSON.stringify({ estado, hlsUrl }),
    }).then(handleResponse),

  eliminarStream: (id: number | string) =>
    fetchWithRetry(`${BASE_URL}/eventos/${id}/stream`, {
      method: 'DELETE',
      headers: buildHeaders(),
    }).then(handleResponse),

  enviarRevision: (id: number | string) =>
    fetchWithRetry(`${BASE_URL}/eventos/${id}/enviar`, {
      method: 'PATCH',
      headers: buildHeaders(),
    }).then(handleResponse),

  create: (body: Record<string, unknown>) =>
    fetchWithRetry(`${BASE_URL}/eventos`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  update: (id: number | string, body: Record<string, unknown>) =>
    fetchWithRetry(`${BASE_URL}/eventos/${id}`, {
      method: 'PUT',
      headers: buildHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  eliminar: (id: number | string) =>
    fetchWithRetry(`${BASE_URL}/eventos/${id}`, {
      method: 'DELETE',
      headers: buildHeaders(),
    }).then(res => { if (!res.ok) return handleResponse(res); }),
};

// ── Usuarios ─────────────────────────────────────────────────
export const usuariosApi = {
  getAll: () =>
    fetchWithRetry(`${BASE_URL}/usuarios`, { headers: buildHeaders() }).then(handleResponse),

  activar: (id: number | string) =>
    fetchWithRetry(`${BASE_URL}/usuarios/${id}/activar`, {
      method: 'PATCH',
      headers: buildHeaders(),
    }).then(handleResponse),

  desactivar: (id: number | string) =>
    fetchWithRetry(`${BASE_URL}/usuarios/${id}/desactivar`, {
      method: 'PATCH',
      headers: buildHeaders(),
    }).then(handleResponse),

  eliminar: (id: number | string) =>
    fetchWithRetry(`${BASE_URL}/usuarios/${id}`, {
      method: 'DELETE',
      headers: buildHeaders(),
    }).then(handleResponse),

  cambiarRol: (id: number | string, rol: string) =>
    fetchWithRetry(`${BASE_URL}/usuarios/${id}/rol`, {
      method: 'PATCH',
      headers: buildHeaders(),
      body: JSON.stringify({ rol }),
    }).then(handleResponse),
};

// ── Categorías ────────────────────────────────────────────────
export const categoriasApi = {
  getAll: () =>
    fetchWithRetry(`${BASE_URL}/categorias`, { headers: buildHeaders() }).then(handleResponse),

  getAllAdmin: () =>
    fetchWithRetry(`${BASE_URL}/categorias/todas`, { headers: buildHeaders() }).then(handleResponse),

  create: (nombre: string) =>
    fetchWithRetry(`${BASE_URL}/categorias`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ nombre }),
    }).then(handleResponse),

  update: (id: number | string, nombre?: string, activa?: boolean) =>
    fetchWithRetry(`${BASE_URL}/categorias/${id}`, {
      method: 'PUT',
      headers: buildHeaders(),
      body: JSON.stringify({ ...(nombre !== undefined && { nombre }), ...(activa !== undefined && { activa }) }),
    }).then(handleResponse),
};

// ── Lugares ──────────────────────────────────────────────────
export const lugaresApi = {
  getAll: () =>
    fetchWithRetry(`${BASE_URL}/lugares`, { headers: buildHeaders() }).then(handleResponse),

  create: (body: { nombre: string; descripcion?: string; latitud?: number; longitud?: number }) =>
    fetchWithRetry(`${BASE_URL}/lugares`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),
};

// ── Favoritos ────────────────────────────────────────────────
export const favoritosApi = {
  getAll: () =>
    fetchWithRetry(`${BASE_URL}/favoritos`, { headers: buildHeaders() }).then(handleResponse),

  add: (eventoId: number | string) =>
    fetchWithRetry(`${BASE_URL}/favoritos/${eventoId}`, {
      method: 'POST',
      headers: buildHeaders(),
    }).then(handleResponse),

  remove: (eventoId: number | string) =>
    fetchWithRetry(`${BASE_URL}/favoritos/${eventoId}`, {
      method: 'DELETE',
      headers: buildHeaders(),
    }).then(handleResponse),

  getInteresados: (eventoId: number | string) =>
    fetchWithRetry(`${BASE_URL}/favoritos/${eventoId}/interesados`, { headers: buildHeaders() }).then(handleResponse),
};
