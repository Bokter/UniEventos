import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { ITransmisionRepository } from '../../domain/repositories/transmision.repository.interface';
import { TRANSMISION_REPOSITORY } from '../../domain/repositories/transmision.repository.interface';

@Injectable()
export class TransmisionService {
  constructor(
    @Inject(TRANSMISION_REPOSITORY)
    private readonly transmisionRepository: ITransmisionRepository,
  ) {}

  async findByEvento(eventoId: number) {
    return this.transmisionRepository.findByEventoId(eventoId);
  }

  async registrar(eventoId: number, organizadorId: number, url: string) {
    try {
      return await this.transmisionRepository.upsert(eventoId, organizadorId, url);
    } catch (error) {
      throw new BadRequestException('No se pudo registrar la transmisión.');
    }
  }

  async eliminar(eventoId: number, organizadorId: number) {
    await this.transmisionRepository.remove(eventoId, organizadorId);
    return { mensaje: 'Enlace de transmisión eliminado' };
  }
}
