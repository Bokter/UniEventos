export interface ITransmisionRepository {
  findByEventoId(eventoId: number): Promise<any | null>;
  create(eventoId: number, urlEnlace: string): Promise<any>;
  update(eventoId: number, urlEnlace: string): Promise<any>;
  remove(eventoId: number): Promise<void>;
}

export const TRANSMISION_REPOSITORY = 'TRANSMISION_REPOSITORY';
