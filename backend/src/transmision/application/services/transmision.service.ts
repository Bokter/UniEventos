import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { ITransmisionRepository } from '../../domain/repositories/transmision.repository.interface';
import { TRANSMISION_REPOSITORY } from '../../domain/repositories/transmision.repository.interface';

@Injectable()
export class TransmisionService {
  constructor(
    @Inject(TRANSMISION_REPOSITORY)
    private readonly transmisionRepository: ITransmisionRepository,
  ) {}

  async findByEvento(eventoId: number) {
    const transmision = await this.transmisionRepository.findByEventoId(eventoId);
    if (!transmision) {
      throw new NotFoundException(`No hay transmisión registrada para el evento ${eventoId}`);
    }
    return transmision;
  }

  async registrar(eventoId: number, urlEnlace: string) {
    // Si ya existe, actualiza; si no, crea
    return this.transmisionRepository.update(eventoId, urlEnlace);
  }

  async eliminar(eventoId: number) {
    await this.transmisionRepository.remove(eventoId);
    return { mensaje: 'Enlace de transmisión eliminado' };
  }
}
