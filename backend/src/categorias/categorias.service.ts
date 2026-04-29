import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from '../entities/categoria.entity';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
  ) {}

  findAllActivas() {
    return this.categoriaRepository.find({ where: { activa: true } });
  }

  findAll() {
    return this.categoriaRepository.find();
  }

  create(nombre: string) {
    const categoria = this.categoriaRepository.create({ nombre, activa: true });
    return this.categoriaRepository.save(categoria);
  }

  async update(id: number, nombre?: string, activa?: boolean) {
    const categoria = await this.categoriaRepository.findOne({ where: { id } });
    if (!categoria) {
      throw new NotFoundException(`Categoria con ID ${id} no encontrada`);
    }
    if (nombre !== undefined) categoria.nombre = nombre;
    if (activa !== undefined) categoria.activa = activa;
    return this.categoriaRepository.save(categoria);
  }
}
