export interface ITransmisionRepository {
  findByEventoId(eventoId: number): Promise<any[]>;
  upsert(eventoId: number, organizadorId: number, url: string): Promise<any>;
  remove(eventoId: number, organizadorId: number): Promise<void>;
}

export const TRANSMISION_REPOSITORY = 'TRANSMISION_REPOSITORY';
