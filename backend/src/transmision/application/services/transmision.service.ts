import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import type { ITransmisionRepository } from '../../domain/repositories/transmision.repository.interface';
import { TRANSMISION_REPOSITORY } from '../../domain/repositories/transmision.repository.interface';
import type { IMuxService } from '../../domain/services/mux.service.interface';
import { MUX_SERVICE } from '../../domain/services/mux.service.interface';

@Injectable()
export class TransmisionService {
  constructor(
    @Inject(TRANSMISION_REPOSITORY)
    private readonly transmisionRepository: ITransmisionRepository,
    @Inject(MUX_SERVICE)
    private readonly muxService: IMuxService,
  ) {}

  async findByEvento(eventoId: number) {
    const transmision = await this.transmisionRepository.findByEventoId(eventoId);
    if (!transmision) {
      throw new NotFoundException(`No hay transmisión registrada para el evento ${eventoId}`);
    }
    return transmision;
  }

  async registrar(eventoId: number) {
    try {
      // 1. Pedir a Mux crear una transmisión
      const muxData = await this.muxService.createLiveStream();
      
      // 2. Guardar las credenciales en nuestra base de datos
      const transmision = await this.transmisionRepository.update(eventoId, {
        stream_id: muxData.stream_id,
        stream_key: muxData.stream_key,
        playback_id: muxData.playback_id,
      });

      return transmision;
    } catch (error) {
      throw new BadRequestException('No se pudo generar la transmisión en vivo. Verifica las credenciales de Mux.');
    }
  }

  async eliminar(eventoId: number) {
    await this.transmisionRepository.remove(eventoId);
    return { mensaje: 'Enlace de transmisión eliminado' };
  }
}
