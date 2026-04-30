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
}
