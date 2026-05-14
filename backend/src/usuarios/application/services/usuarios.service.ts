import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IUsuarioAdminRepository } from '../../domain/repositories/usuario-admin.repository.interface';
import { USUARIO_ADMIN_REPOSITORY } from '../../domain/repositories/usuario-admin.repository.interface';
import * as https from 'https';

// Helper para peticiones HTTP con módulo nativo de Node (sin dependencias externas)
function httpsRequest(url: string, options: https.RequestOptions, body?: string): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode ?? 0, data: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode ?? 0, data: raw }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

@Injectable()
export class UsuariosService {
  constructor(
    @Inject(USUARIO_ADMIN_REPOSITORY)
    private readonly usuarioRepository: IUsuarioAdminRepository,
  ) {}

  async findAll() {
    return this.usuarioRepository.findAll();
  }

  async findOne(id: number) {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return usuario;
  }

  async activar(id: number) {
    return this.usuarioRepository.updateActivo(id, true);
  }

  async desactivar(id: number) {
    return this.usuarioRepository.updateActivo(id, false);
  }

  async cambiarRol(id: number, rol: string) {
    return this.usuarioRepository.updateRol(id, rol);
  }

  async eliminar(id: number) {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // 1. Eliminar de Roble si es cuenta de uninorte
    if (usuario.email && usuario.email.endsWith('@uninorte.edu.co')) {
      try {
        const robleBody = JSON.stringify({
          tableName: 'usuarios',
          idColumn: 'email',
          idValue: usuario.email,
        });
        const token = process.env.ROBLE_API_KEY;
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(robleBody).toString(),
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const result = await httpsRequest(
          'https://roble-api.openlab.uninorte.edu.co/database/unieventos_f90d41b197/delete',
          { method: 'DELETE', headers },
          robleBody,
        );

        if (result.status < 200 || result.status >= 300) {
          console.warn(`No se pudo eliminar ${usuario.email} de Roble (status ${result.status}):`, result.data);
        }
      } catch (error) {
        console.error('Error contactando a Roble para eliminar usuario:', error);
      }
    }

    // 2. Eliminar localmente
    await this.usuarioRepository.delete(id);
    return { mensaje: 'Usuario eliminado exitosamente' };
  }
}

