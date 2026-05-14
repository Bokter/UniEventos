import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IUsuarioAdminRepository } from '../../domain/repositories/usuario-admin.repository.interface';
import { USUARIO_ADMIN_REPOSITORY } from '../../domain/repositories/usuario-admin.repository.interface';

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
        // En base a la doc de Roble proporcionada
        const robleRes = await fetch('https://roble-api.openlab.uninorte.edu.co/database/unieventos_f90d41b197/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            // El token provisto o simplemente no bearer si Roble lo acepta así en este caso, 
            // idealmente deberías proveer la variable de entorno real
            'Authorization': process.env.ROBLE_API_KEY ? `Bearer ${process.env.ROBLE_API_KEY}` : ''
          },
          body: JSON.stringify({
            tableName: 'usuarios',
            idColumn: 'email',
            idValue: usuario.email
          })
        });
        
        if (!robleRes.ok) {
           const errorData = await robleRes.json().catch(() => ({}));
           console.warn(`No se pudo eliminar el usuario ${usuario.email} de Roble:`, errorData);
        }
      } catch (error) {
        console.error("Error contactando a Roble para eliminar usuario:", error);
      }
    }

    // 2. Eliminar localmente
    await this.usuarioRepository.delete(id);
    return { mensaje: 'Usuario eliminado exitosamente' };
  }
}
