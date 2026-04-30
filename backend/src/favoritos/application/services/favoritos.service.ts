import { Injectable, Inject, ConflictException } from '@nestjs/common';
import type { IFavoritoRepository } from '../../domain/repositories/favorito.repository.interface';
import { FAVORITO_REPOSITORY } from '../../domain/repositories/favorito.repository.interface';

@Injectable()
export class FavoritosService {
  constructor(
    @Inject(FAVORITO_REPOSITORY)
    private readonly favoritoRepository: IFavoritoRepository,
  ) {}

  async findByUsuario(usuarioId: number) {
    const favoritos = await this.favoritoRepository.findByUsuarioId(usuarioId);
    // Retornar solo los eventos (el usuario ya sabe que son sus favoritos)
    return favoritos.map((f: any) => ({
      id: f.id,
      evento: f.evento,
      created_at: f.created_at,
    }));
  }

  async agregar(usuarioId: number, eventoId: number) {
    const existe = await this.favoritoRepository.findOne(usuarioId, eventoId);
    if (existe) {
      throw new ConflictException('Este evento ya está en tus favoritos');
    }
    return this.favoritoRepository.create(usuarioId, eventoId);
  }

  async eliminar(usuarioId: number, eventoId: number) {
    await this.favoritoRepository.remove(usuarioId, eventoId);
    return { mensaje: 'Evento eliminado de favoritos' };
  }

  async obtenerInteresados(eventoId: number): Promise<string[]> {
    return this.favoritoRepository.findEmailsByEventoId(eventoId);
  }
}
