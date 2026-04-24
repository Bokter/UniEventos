import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evento, EstadoEvento } from '../entities/evento.entity';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';

@Injectable()
export class EventosService {
  constructor(
    @InjectRepository(Evento)
    private readonly eventoRepository: Repository<Evento>,
  ) {}

  async findAll(categoria?: number, fecha?: string) {
    const query = this.eventoRepository.createQueryBuilder('evento')
      .leftJoinAndSelect('evento.categoria', 'categoria')
      .leftJoinAndSelect('evento.lugar', 'lugar')
      .leftJoinAndSelect('evento.organizador', 'organizador')
      .where('evento.estado = :estado', { estado: EstadoEvento.APROBADO });

    if (categoria) {
      query.andWhere('evento.categoria_id = :categoria', { categoria });
    }
    if (fecha) {
      query.andWhere('evento.fecha = :fecha', { fecha });
    }

    return await query.getMany();
  }

  async findOne(id: number) {
    const evento = await this.eventoRepository.findOne({
      where: { id },
      relations: ['categoria', 'lugar', 'organizador'],
    });
    if (!evento) {
      throw new NotFoundException(`Evento con ID ${id} no encontrado`);
    }
    return evento;
  }

  async findPendientes() {
    return await this.eventoRepository.find({
      where: { estado: EstadoEvento.PENDIENTE },
      relations: ['categoria', 'lugar', 'organizador'],
    });
  }

  async create(createEventoDto: CreateEventoDto, organizadorId: number) {
    const { categoria_id, lugar_id, ...rest } = createEventoDto;
    const nuevoEvento = this.eventoRepository.create({
      ...rest,
      categoria: { id: categoria_id } as any,
      lugar: { id: lugar_id } as any,
      organizador: { id: organizadorId } as any,
      estado: EstadoEvento.BORRADOR,
    });
    return await this.eventoRepository.save(nuevoEvento);
  }

  async update(id: number, updateEventoDto: UpdateEventoDto) {
    const evento = await this.findOne(id);
    if (evento.estado !== EstadoEvento.BORRADOR && evento.estado !== EstadoEvento.RECHAZADO) {
      throw new BadRequestException('Solo se pueden editar eventos en borrador o rechazados');
    }
    
    const { categoria_id, lugar_id, ...rest } = updateEventoDto;

    if (categoria_id) {
      evento.categoria = { id: categoria_id } as any;
    }
    if (lugar_id) {
      evento.lugar = { id: lugar_id } as any;
    }
    
    Object.assign(evento, rest);
    return await this.eventoRepository.save(evento);
  }

  async enviarRevision(id: number) {
    const evento = await this.findOne(id);
    evento.estado = EstadoEvento.PENDIENTE;
    return await this.eventoRepository.save(evento);
  }

  async cancelar(id: number) {
    const evento = await this.findOne(id);
    evento.estado = EstadoEvento.CANCELADO;
    return await this.eventoRepository.save(evento);
  }

  async aprobar(id: number) {
    const evento = await this.findOne(id);
    evento.estado = EstadoEvento.APROBADO;
    evento.observacion_admin = null;
    return await this.eventoRepository.save(evento);
  }

  async rechazar(id: number, observacion: string) {
    const evento = await this.findOne(id);
    evento.estado = EstadoEvento.RECHAZADO;
    evento.observacion_admin = observacion;
    return await this.eventoRepository.save(evento);
  }
}
