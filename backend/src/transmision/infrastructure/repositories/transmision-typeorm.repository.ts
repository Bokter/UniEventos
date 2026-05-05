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

  async create(eventoId: number, data: { stream_id: string; stream_key: string; playback_id: string }) {
    const transmision = this.repo.create({
      evento: { id: eventoId } as any,
      stream_id: data.stream_id,
      stream_key: data.stream_key,
      playback_id: data.playback_id,
    });
    return this.repo.save(transmision);
  }

  async update(eventoId: number, data: { stream_id: string; stream_key: string; playback_id: string }) {
    const transmision = await this.findByEventoId(eventoId);
    if (transmision) {
      transmision.stream_id = data.stream_id;
      transmision.stream_key = data.stream_key;
      transmision.playback_id = data.playback_id;
      return this.repo.save(transmision);
    }
    // Si no existe, crear una nueva
    return this.create(eventoId, data);
  }

  async remove(eventoId: number) {
    const transmision = await this.findByEventoId(eventoId);
    if (transmision) {
      await this.repo.remove(transmision);
    }
  }
}
