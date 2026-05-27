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

  async findByEventoAndOrganizador(eventoId: number, organizadorId: number) {
    return this.repo.findOne({
      where: {
        evento: { id: eventoId },
        organizador: { id: organizadorId },
      },
      relations: ['organizador'],
    });
  }

  async upsert(eventoId: number, organizadorId: number, meetingId: string) {
    let transmision = await this.repo.findOne({
      where: {
        evento: { id: eventoId },
        organizador: { id: organizadorId },
      },
    });

    if (!transmision) {
      transmision = this.repo.create({
        evento: { id: eventoId } as any,
        organizador: { id: organizadorId } as any,
      });
    }

    transmision.meeting_id = meetingId;
    transmision.estado = 'idle';
    transmision.hls_url = null;
    return this.repo.save(transmision);
  }

  async updateEstado(eventoId: number, estado: 'idle' | 'live' | 'ended', hlsUrl?: string | null) {
    const updatePayload = this.buildEstadoPayload(estado, hlsUrl);
    await this.repo
      .createQueryBuilder()
      .update(TransmisionOrmEntity)
      .set(updatePayload)
      .where('evento_id = :eventoId', { eventoId })
      .execute();
  }

  async updateEstadoForOrganizador(
    eventoId: number,
    organizadorId: number,
    estado: 'idle' | 'live' | 'ended',
    hlsUrl?: string | null,
  ) {
    const updatePayload = this.buildEstadoPayload(estado, hlsUrl);
    await this.repo
      .createQueryBuilder()
      .update(TransmisionOrmEntity)
      .set(updatePayload)
      .where('evento_id = :eventoId AND usuario_id = :organizadorId', {
        eventoId,
        organizadorId,
      })
      .execute();
  }

  private buildEstadoPayload(
    estado: 'idle' | 'live' | 'ended',
    hlsUrl?: string | null,
  ): Partial<TransmisionOrmEntity> {
    const updatePayload: Partial<TransmisionOrmEntity> = { estado };
    if (hlsUrl !== undefined) {
      updatePayload.hls_url = hlsUrl;
    } else if (estado === 'idle' || estado === 'ended') {
      updatePayload.hls_url = null;
    }
    return updatePayload;
  }

  async remove(eventoId: number, organizadorId: number) {
    const transmision = await this.repo.findOne({
      where: {
        evento: { id: eventoId },
        organizador: { id: organizadorId },
      },
    });

    if (transmision) {
      await this.repo.remove(transmision);
    }
  }
}
