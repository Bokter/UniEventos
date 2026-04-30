import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriaOrmEntity } from '../entities/categoria.orm-entity';
import { ICategoriaRepository } from '../../domain/repositories/categoria.repository.interface';

@Injectable()
export class CategoriaTypeormRepository implements ICategoriaRepository {
  constructor(
    @InjectRepository(CategoriaOrmEntity)
    private readonly repo: Repository<CategoriaOrmEntity>,
  ) {}

  async findAllActivas() {
    return this.repo.find({ where: { activa: true } });
  }

  async findAll() {
    return this.repo.find();
  }

  async findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async create(nombre: string) {
    const categoria = this.repo.create({ nombre, activa: true });
    return this.repo.save(categoria);
  }

  async save(categoria: any) {
    return this.repo.save(categoria);
  }
}
