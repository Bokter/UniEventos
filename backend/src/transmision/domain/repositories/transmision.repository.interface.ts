export interface ITransmisionRepository {
  findByEventoId(eventoId: number): Promise<any[]>;
  findByEventoAndOrganizador(eventoId: number, organizadorId: number): Promise<any | null>;
  upsert(eventoId: number, organizadorId: number, meetingId: string): Promise<any>;
  updateEstado(eventoId: number, estado: 'idle' | 'live' | 'ended', hlsUrl?: string | null): Promise<void>;
  updateEstadoForOrganizador(
    eventoId: number,
    organizadorId: number,
    estado: 'idle' | 'live' | 'ended',
    hlsUrl?: string | null,
  ): Promise<void>;
  remove(eventoId: number, organizadorId: number): Promise<void>;
}

export const TRANSMISION_REPOSITORY = 'TRANSMISION_REPOSITORY';
