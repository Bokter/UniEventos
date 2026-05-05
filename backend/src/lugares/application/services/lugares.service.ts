import { Injectable, Inject } from '@nestjs/common';
import type { ILugarRepository } from '../../domain/repositories/lugar.repository.interface';
import { LUGAR_REPOSITORY } from '../../domain/repositories/lugar.repository.interface';
import { CreateLugarDto } from '../dto/create-lugar.dto';
import { UpdateLugarDto } from '../dto/update-lugar.dto';

@Injectable()
export class LugaresService {
  constructor(
    @Inject(LUGAR_REPOSITORY)
    private readonly lugarRepository: ILugarRepository,
  ) {}

  findAll() {
    return this.lugarRepository.findAll();
  }

  findOne(id: number) {
    return this.lugarRepository.findById(id);
  }

  create(dto: CreateLugarDto) {
    return this.lugarRepository.create(dto);
  }

  update(id: number, dto: UpdateLugarDto) {
    return this.lugarRepository.update(id, dto);
  }
}
