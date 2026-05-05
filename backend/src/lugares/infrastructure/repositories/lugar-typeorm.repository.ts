import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LugarOrmEntity } from '../entities/lugar.orm-entity';
import { ILugarRepository } from '../../domain/repositories/lugar.repository.interface';

@Injectable()
export class LugarTypeormRepository implements ILugarRepository {
  constructor(
    @InjectRepository(LugarOrmEntity)
    private readonly repo: Repository<LugarOrmEntity>,
  ) {}

  async findAll() {
    return this.repo.find();
  }

  async findById(id: number) {
    return this.repo.findOneBy({ id });
  }

  async create(data: any) {
    const lugar = this.repo.create(data);
    return this.repo.save(lugar);
  }

  async update(id: number, data: any) {
    await this.repo.update(id, data);
    return this.repo.findOneBy({ id });
  }
}
