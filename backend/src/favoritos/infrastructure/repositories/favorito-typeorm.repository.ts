import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FavoritoOrmEntity } from '../entities/favorito.orm-entity';
import { IFavoritoRepository } from '../../domain/repositories/favorito.repository.interface';

@Injectable()
export class FavoritoTypeormRepository implements IFavoritoRepository {
  constructor(
    @InjectRepository(FavoritoOrmEntity)
    private readonly repo: Repository<FavoritoOrmEntity>,
  ) {}

  async findByUsuarioId(usuarioId: number) {
    return this.repo.find({
      where: { usuario: { id: usuarioId } },
      relations: ['evento', 'evento.categoria', 'evento.lugar'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(usuarioId: number, eventoId: number) {
    return this.repo.findOne({
      where: {
        usuario: { id: usuarioId },
        evento: { id: eventoId },
      },
    });
  }

  async create(usuarioId: number, eventoId: number) {
    const favorito = this.repo.create({
      usuario: { id: usuarioId } as any,
      evento: { id: eventoId } as any,
    });
    return this.repo.save(favorito);
  }

  async remove(usuarioId: number, eventoId: number) {
    await this.repo.delete({
      usuario: { id: usuarioId },
      evento: { id: eventoId },
    });
  }
}
