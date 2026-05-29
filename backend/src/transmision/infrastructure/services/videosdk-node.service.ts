import {
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { IVideoSDKService } from '../../domain/services/videosdk.service.interface';

const PLACEHOLDER_API_KEY = 'your_videosdk_api_key_here';
const PLACEHOLDER_SECRET_KEY = 'your_videosdk_secret_key_here';

@Injectable()
export class VideoSDKNodeService implements IVideoSDKService {
  private readonly logger = new Logger(VideoSDKNodeService.name);
  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly apiBase = 'https://api.videosdk.live/v2';

  constructor() {
    this.apiKey = process.env.VIDEOSDK_API_KEY || '';
    this.secretKey = process.env.VIDEOSDK_SECRET_KEY || '';

    if (!this.isConfigured()) {
      this.logger.warn(
        'VIDEOSDK_API_KEY o VIDEOSDK_SECRET_KEY no están configuradas. ' +
          'Las transmisiones en vivo no estarán disponibles.',
      );
    }
  }

  isConfigured(): boolean {
    return (
      !!this.apiKey &&
      !!this.secretKey &&
      this.apiKey !== PLACEHOLDER_API_KEY &&
      this.secretKey !== PLACEHOLDER_SECRET_KEY
    );
  }

  private assertConfigured(): void {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException(
        'VideoSDK no está configurado. Define VIDEOSDK_API_KEY y VIDEOSDK_SECRET_KEY en el backend ' +
          '(https://app.videosdk.live/api-keys).',
      );
    }
  }

  generateToken(_roomId?: string, role: 'host' | 'viewer' = 'viewer'): string {
    this.assertConfigured();

    // No se incluye roomId en el payload: un token con roomId restringido provoca
    // errores 401 en las llamadas internas del SDK (p. ej. /infra/v1/meetings/init-config)
    // porque esas rutas de infraestructura no aceptan tokens de sala específica.
    // El acceso a la sala correcto ya está garantizado por el meetingId que pasa el cliente.
    const permissions =
      role === 'host' ? ['allow_join', 'allow_mod'] : ['allow_join'];

    const payload: Record<string, unknown> = {
      apikey: this.apiKey,
      permissions,
    };

    return jwt.sign(payload, this.secretKey, {
      algorithm: 'HS256',
      expiresIn: '24h',
    });
  }

  async createRoom(): Promise<{ roomId: string }> {
    this.assertConfigured();

    const token = this.generateToken(undefined, 'host');

    const response = await fetch(`${this.apiBase}/rooms`, {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      this.logger.error('Error al crear sala en VideoSDK:', error);
      throw new InternalServerErrorException(
        'No se pudo crear la sala de transmisión en VideoSDK. Verifica tus credenciales.',
      );
    }

    const data = await response.json();
    return { roomId: data.roomId as string };
  }
}
