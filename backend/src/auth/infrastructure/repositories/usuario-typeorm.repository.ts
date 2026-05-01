import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioOrmEntity } from '../entities/usuario.orm-entity';
import { IUsuarioRepository } from '../../domain/repositories/usuario.repository.interface';
import { RolUsuario } from '../../domain/enums/rol-usuario.enum';

@Injectable()
export class UsuarioTypeormRepository implements IUsuarioRepository {
  constructor(
    @InjectRepository(UsuarioOrmEntity)
    private readonly repo: Repository<UsuarioOrmEntity>,
  ) {}

  async findByEmail(email: string) {
    return this.repo.findOneBy({ email });
  }

  async create(data: { nombre_completo: string; email: string; password_hash: string; rol: RolUsuario }) {
    const usuario = this.repo.create(data);
    const guardado = await this.repo.save(usuario);
    return guardado;
  }
}
