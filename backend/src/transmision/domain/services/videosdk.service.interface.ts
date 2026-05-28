export interface IVideoSDKService {
  /** Indica si las credenciales de VideoSDK están configuradas */
  isConfigured(): boolean;

  /** Crea una sala de reunión en VideoSDK y devuelve el roomId */
  createRoom(): Promise<{ roomId: string }>;

  /**
   * Genera un token JWT firmado para VideoSDK.
   * @param roomId  Si se proporciona, el token queda limitado a esa sala.
   * @param role    'host' (puede iniciar HLS) o 'viewer' (solo observa)
   */
  generateToken(roomId?: string, role?: 'host' | 'viewer'): string;
}

export const VIDEOSDK_SERVICE = 'VIDEOSDK_SERVICE';
