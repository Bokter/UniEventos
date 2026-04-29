import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lugar } from '../entities/lugar.entity';

@Injectable()
export class LugaresService {
  constructor(
    @InjectRepository(Lugar)
    private readonly lugarRepository: Repository<Lugar>,
  ) {}

  findAll() {
    return this.lugarRepository.find();
  }
}
