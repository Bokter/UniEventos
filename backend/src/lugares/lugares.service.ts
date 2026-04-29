import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lugar } from '../entities/lugar.entity';
import { CreateLugarDto } from './dto/create-lugar.dto';
import { UpdateLugarDto } from './dto/update-lugar.dto';

@Injectable()
export class LugaresService {
  constructor(
    @InjectRepository(Lugar)
    private readonly lugarRepo: Repository<Lugar>,
  ) {}

  findAll() {
    return this.lugarRepo.find();
  }

  findOne(id: number) {
    return this.lugarRepo.findOneBy({ id });
  }

  create(dto: CreateLugarDto) {
    const lugar = this.lugarRepo.create(dto);
    return this.lugarRepo.save(lugar);
  }

  async update(id: number, dto: UpdateLugarDto) {
    await this.lugarRepo.update(id, dto);
    return this.lugarRepo.findOneBy({ id });
  }
}