import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { ICategoriaRepository } from '../../domain/repositories/categoria.repository.interface';
import { CATEGORIA_REPOSITORY } from '../../domain/repositories/categoria.repository.interface';

@Injectable()
export class CategoriasService {
  constructor(
    @Inject(CATEGORIA_REPOSITORY)
    private readonly categoriaRepository: ICategoriaRepository,
  ) {}

  findAllActivas() {
    return this.categoriaRepository.findAllActivas();
  }

  findAll() {
    return this.categoriaRepository.findAll();
  }

  create(nombre: string) {
    return this.categoriaRepository.create(nombre);
  }

  async update(id: number, nombre?: string, activa?: boolean) {
    const categoria = await this.categoriaRepository.findById(id);
    if (!categoria) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    if (nombre !== undefined) categoria.nombre = nombre;
    if (activa !== undefined) categoria.activa = activa;
    return this.categoriaRepository.save(categoria);
  }
}
