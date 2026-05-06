import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Mux from '@mux/mux-node';
import { IMuxService } from '../../domain/services/mux.service.interface';

@Injectable()
export class MuxNodeService implements IMuxService {
  private mux: Mux;

  constructor() {
    // Se instanciará automáticamente tomando MUX_TOKEN_ID y MUX_TOKEN_SECRET de las variables de entorno
    try {
      this.mux = new Mux({
        tokenId: process.env.MUX_TOKEN_ID || 'dummy_id',
        tokenSecret: process.env.MUX_TOKEN_SECRET || 'dummy_secret',
      });
    } catch (error) {
      console.warn('Advertencia: No se encontraron las credenciales de Mux en el entorno.');
    }
  }

  async createLiveStream() {
    try {
      const liveStream = await this.mux.video.liveStreams.create({
        playback_policy: ['public'],
        new_asset_settings: { playback_policy: ['public'] },
      });

      return {
        stream_id: liveStream.id,
        stream_key: liveStream.stream_key,
        playback_id: liveStream.playback_ids?.[0]?.id || '',
      };
    } catch (error) {
      throw new InternalServerErrorException('Error al comunicarse con la API de Mux: ' + error.message);
    }
  }
}
