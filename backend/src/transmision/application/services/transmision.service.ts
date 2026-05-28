import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { ITransmisionRepository } from '../../domain/repositories/transmision.repository.interface';
import { TRANSMISION_REPOSITORY } from '../../domain/repositories/transmision.repository.interface';
import { VIDEOSDK_SERVICE } from '../../domain/services/videosdk.service.interface';
import type { IVideoSDKService } from '../../domain/services/videosdk.service.interface';

@Injectable()
export class TransmisionService {
  constructor(
    @Inject(TRANSMISION_REPOSITORY)
    private readonly transmisionRepository: ITransmisionRepository,
    @Inject(VIDEOSDK_SERVICE)
    private readonly videosdkService: IVideoSDKService,
  ) {}

  async findByEvento(eventoId: number) {
    return this.transmisionRepository.findByEventoId(eventoId);
  }

  /**
   * Abre sesión del transmisor: reutiliza sala si está idle/live,
   * o crea sala nueva si no existe o la transmisión anterior terminó (ended).
   */
  async iniciarTransmision(eventoId: number, organizadorId: number) {
    if (!this.videosdkService.isConfigured()) {
      throw new BadRequestException(
        'Las transmisiones en vivo no están disponibles: configura VIDEOSDK_API_KEY y VIDEOSDK_SECRET_KEY en el servidor.',
      );
    }

    try {
      const existing = await this.transmisionRepository.findByEventoAndOrganizador(
        eventoId,
        organizadorId,
      );

      if (existing?.meeting_id && existing.estado !== 'ended') {
        const token = this.videosdkService.generateToken(existing.meeting_id, 'host');
        return {
          meetingId: existing.meeting_id,
          token,
          estado: existing.estado,
        };
      }

      const { roomId } = await this.videosdkService.createRoom();
      await this.transmisionRepository.upsert(eventoId, organizadorId, roomId);
      const token = this.videosdkService.generateToken(roomId, 'host');
      return { meetingId: roomId, token, estado: 'idle' as const };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('No se pudo iniciar la transmisión.');
    }
  }

  async obtenerToken(eventoId: number, userId?: number) {
    const transmisiones = await this.transmisionRepository.findByEventoId(eventoId);
    if (!transmisiones || transmisiones.length === 0) {
      throw new BadRequestException('No hay ninguna transmisión activa para este evento.');
    }

    const transmision =
      userId != null
        ? transmisiones.find(
            (t) => t.organizador && String(t.organizador.id) === String(userId),
          ) ?? transmisiones[0]
        : transmisiones[0];

    if (!transmision.meeting_id) {
      throw new BadRequestException('La transmisión no tiene una sala asignada.');
    }

    const esOrganizador =
      userId != null &&
      transmision.organizador != null &&
      String(transmision.organizador.id) === String(userId);
    const role = esOrganizador ? 'host' : 'viewer';
    const token = this.videosdkService.generateToken(transmision.meeting_id, role);

    return {
      token,
      meetingId: transmision.meeting_id,
      estado: transmision.estado,
      hlsUrl: transmision.hls_url,
      role,
    };
  }

  async actualizarEstado(
    eventoId: number,
    organizadorId: number,
    estado: 'idle' | 'live' | 'ended',
    hlsUrl?: string | null,
  ) {
    try {
      await this.transmisionRepository.updateEstadoForOrganizador(
        eventoId,
        organizadorId,
        estado,
        hlsUrl,
      );
      return { mensaje: `Estado de transmisión actualizado a ${estado}` };
    } catch (error) {
      throw new BadRequestException('No se pudo actualizar el estado de la transmisión.');
    }
  }

  async eliminar(eventoId: number, organizadorId: number) {
    await this.transmisionRepository.remove(eventoId, organizadorId);
    return { mensaje: 'Enlace de transmisión eliminado' };
  }
}
