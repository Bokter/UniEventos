import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioOrmEntity } from '../../../auth/infrastructure/entities/usuario.orm-entity';
import { IUsuarioAdminRepository } from '../../domain/repositories/usuario-admin.repository.interface';

@Injectable()
export class UsuarioAdminTypeormRepository implements IUsuarioAdminRepository {
  constructor(
    @InjectRepository(UsuarioOrmEntity)
    private readonly repo: Repository<UsuarioOrmEntity>,
  ) {}

  async findAll() {
    const usuarios = await this.repo.find({ order: { created_at: 'DESC' } });
    // Excluir password_hash de la respuesta
    return usuarios.map(({ password_hash, ...rest }) => rest);
  }

  async findById(id: number) {
    const usuario = await this.repo.findOne({ where: { id } });
    if (!usuario) return null;
    const { password_hash, ...rest } = usuario;
    return rest;
  }

  async updateActivo(id: number, activo: boolean) {
    const usuario = await this.repo.findOne({ where: { id } });
    if (!usuario) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    usuario.activo = activo;
    const guardado = await this.repo.save(usuario);
    const { password_hash, ...rest } = guardado;
    return rest;
  }

  async updateRol(id: number, rol: string) {
    const usuario = await this.repo.findOne({ where: { id } });
    if (!usuario) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    usuario.rol = rol as any;
    const guardado = await this.repo.save(usuario);
    const { password_hash, ...rest } = guardado;
    return rest;
  }
}
