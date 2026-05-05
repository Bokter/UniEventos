export interface ITransmisionRepository {
  findByEventoId(eventoId: number): Promise<any | null>;
  create(eventoId: number, data: { stream_id: string; stream_key: string; playback_id: string }): Promise<any>;
  update(eventoId: number, data: { stream_id: string; stream_key: string; playback_id: string }): Promise<any>;
  remove(eventoId: number): Promise<void>;
}

export const TRANSMISION_REPOSITORY = 'TRANSMISION_REPOSITORY';
