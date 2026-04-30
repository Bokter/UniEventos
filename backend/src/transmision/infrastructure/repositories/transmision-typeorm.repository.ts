import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransmisionOrmEntity } from '../entities/transmision.orm-entity';
import { ITransmisionRepository } from '../../domain/repositories/transmision.repository.interface';

@Injectable()
export class TransmisionTypeormRepository implements ITransmisionRepository {
  constructor(
    @InjectRepository(TransmisionOrmEntity)
    private readonly repo: Repository<TransmisionOrmEntity>,
  ) {}

  async findByEventoId(eventoId: number) {
    return this.repo.findOne({
      where: { evento: { id: eventoId } },
    });
  }

  async create(eventoId: number, urlEnlace: string) {
    const transmision = this.repo.create({
      evento: { id: eventoId } as any,
      url_enlace: urlEnlace,
    });
    return this.repo.save(transmision);
  }

  async update(eventoId: number, urlEnlace: string) {
    const transmision = await this.findByEventoId(eventoId);
    if (transmision) {
      transmision.url_enlace = urlEnlace;
      return this.repo.save(transmision);
    }
    // Si no existe, crear una nueva
    return this.create(eventoId, urlEnlace);
  }

  async remove(eventoId: number) {
    const transmision = await this.findByEventoId(eventoId);
    if (transmision) {
      await this.repo.remove(transmision);
    }
  }
}
