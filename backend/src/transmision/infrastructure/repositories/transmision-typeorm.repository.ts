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
    return this.repo.find({
      where: { evento: { id: eventoId } },
      relations: ['organizador'],
    });
  }

  async upsert(eventoId: number, organizadorId: number, url: string) {
    let transmision = await this.repo.findOne({
      where: { 
        evento: { id: eventoId },
        organizador: { id: organizadorId }
      },
    });

    if (!transmision) {
      transmision = this.repo.create({
        evento: { id: eventoId } as any,
        organizador: { id: organizadorId } as any,
      });
    }

    transmision.stream_url = url;
    return this.repo.save(transmision);
  }

  async remove(eventoId: number, organizadorId: number) {
    const transmision = await this.repo.findOne({
      where: { 
        evento: { id: eventoId },
        organizador: { id: organizadorId }
      },
    });
    
    if (transmision) {
      await this.repo.remove(transmision);
    }
  }
}
