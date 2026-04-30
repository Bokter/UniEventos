export interface IFavoritoRepository {
  findByUsuarioId(usuarioId: number): Promise<any[]>;
  findOne(usuarioId: number, eventoId: number): Promise<any | null>;
  create(usuarioId: number, eventoId: number): Promise<any>;
  remove(usuarioId: number, eventoId: number): Promise<void>;
  findEmailsByEventoId(eventoId: number): Promise<string[]>;
}

export const FAVORITO_REPOSITORY = 'FAVORITO_REPOSITORY';
