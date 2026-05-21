import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
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

  async create(nombre: string) {
    if (!nombre || !nombre.trim()) {
      throw new BadRequestException('El nombre de la categoría no puede estar vacío');
    }
    const all = await this.categoriaRepository.findAll();
    const existing = all.find(c => c.nombre.trim().toLowerCase() === nombre.trim().toLowerCase());
    if (existing) {
      if (!existing.activa) {
        throw new BadRequestException(`La categoría "${existing.nombre}" ya existe y está desactivada. Por favor, actívala en la lista.`);
      }
      throw new BadRequestException(`La categoría "${existing.nombre}" ya existe.`);
    }
    return this.categoriaRepository.create(nombre.trim());
  }

  async update(id: number, nombre?: string, activa?: boolean) {
    const categoria = await this.categoriaRepository.findById(id);
    if (!categoria) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    if (nombre !== undefined && nombre.trim() !== '') {
      const trimmedNombre = nombre.trim();
      if (trimmedNombre.toLowerCase() !== categoria.nombre.toLowerCase()) {
        const all = await this.categoriaRepository.findAll();
        const existing = all.find(c => c.nombre.trim().toLowerCase() === trimmedNombre.toLowerCase() && c.id !== id);
        if (existing) {
          throw new BadRequestException(`La categoría "${existing.nombre}" ya existe.`);
        }
      }
      categoria.nombre = trimmedNombre;
    }
    if (activa !== undefined) categoria.activa = activa;
    return this.categoriaRepository.save(categoria);
  }
}
