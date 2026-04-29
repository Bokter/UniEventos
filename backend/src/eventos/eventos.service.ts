import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evento, EstadoEvento } from '../entities/evento.entity';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { Lugar } from '../entities/lugar.entity';
import { EventoArDto } from './dto/evento-ar.dto';


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

  async findMisEventos(organizadorId: number) {
    return await this.eventoRepository.find({
      where: { organizador: { id: organizadorId } },
      relations: ['categoria', 'lugar'],
      order: { created_at: 'DESC' },
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

  async findEventosAR(): Promise<EventoArDto[]> {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);

  const eventos = await this.eventoRepository
    .createQueryBuilder('e')
    .innerJoinAndSelect('e.lugar', 'l')
    .where('e.fecha >= :hoy AND e.fecha < :manana', { hoy, manana })
    .andWhere('e.estado = :estado', { estado: EstadoEvento.APROBADO })
    .andWhere('l.latitud IS NOT NULL')
    .getMany();

  return eventos.map((e) => ({
    id: e.id,
    titulo: e.titulo,
    descripcion: e.descripcion,
    hora_inicio: e.hora_inicio,
    hora_fin: e.hora_fin,
    lugar_nombre: e.lugar.nombre,
    latitud: Number(e.lugar.latitud),
    longitud: Number(e.lugar.longitud),
  }));
}

}
