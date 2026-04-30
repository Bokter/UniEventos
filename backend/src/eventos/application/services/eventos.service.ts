import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { EstadoEvento } from '../../domain/enums/estado-evento.enum';
import type { IEventoRepository } from '../../domain/repositories/evento.repository.interface';
import { EVENTO_REPOSITORY } from '../../domain/repositories/evento.repository.interface';
import { CreateEventoDto } from '../dto/create-evento.dto';
import { UpdateEventoDto } from '../dto/update-evento.dto';
import { EventoArDto } from '../dto/evento-ar.dto';

@Injectable()
export class EventosService {
  constructor(
    @Inject(EVENTO_REPOSITORY)
    private readonly eventoRepository: IEventoRepository,
  ) {}

  async findAll(categoria?: number, fecha?: string) {
    return this.eventoRepository.findAllAprobados(categoria, fecha);
  }

  async findOne(id: number) {
    const evento = await this.eventoRepository.findById(id);
    if (!evento) {
      throw new NotFoundException(`Evento con ID ${id} no encontrado`);
    }
    return evento;
  }

  async findPendientes() {
    return this.eventoRepository.findPendientes();
  }

  async findMisEventos(organizadorId: number) {
    return this.eventoRepository.findByOrganizadorId(organizadorId);
  }

  async create(createEventoDto: CreateEventoDto, organizadorId: number) {
    return this.eventoRepository.create({
      ...createEventoDto,
      organizador_id: organizadorId,
      categoria_id: createEventoDto.categoria_id,
      lugar_id: createEventoDto.lugar_id,
      estado: EstadoEvento.BORRADOR,
    });
  }

  async update(id: number, updateEventoDto: UpdateEventoDto) {
    const evento = await this.findOne(id);
    if (evento.estado !== EstadoEvento.BORRADOR && evento.estado !== EstadoEvento.RECHAZADO) {
      throw new BadRequestException('Solo se pueden editar eventos en borrador o rechazados');
    }

    Object.assign(evento, updateEventoDto);
    return this.eventoRepository.save(evento);
  }

  async enviarRevision(id: number) {
    const evento = await this.findOne(id);
    evento.estado = EstadoEvento.PENDIENTE;
    return this.eventoRepository.save(evento);
  }

  async cancelar(id: number) {
    const evento = await this.findOne(id);
    evento.estado = EstadoEvento.CANCELADO;
    return this.eventoRepository.save(evento);
  }

  async aprobar(id: number) {
    const evento = await this.findOne(id);
    evento.estado = EstadoEvento.APROBADO;
    evento.observacion_admin = null;
    return this.eventoRepository.save(evento);
  }

  async rechazar(id: number, observacion: string) {
    const evento = await this.findOne(id);
    evento.estado = EstadoEvento.RECHAZADO;
    evento.observacion_admin = observacion;
    return this.eventoRepository.save(evento);
  }

  async findEventosAR(): Promise<EventoArDto[]> {
    const eventos = await this.eventoRepository.findEventosHoyConCoordenadas();
    return eventos.map((e) => ({
      id: e.id,
      titulo: e.titulo,
      descripcion: e.descripcion,
      hora_inicio: e.hora_inicio,
      hora_fin: e.hora_fin,
      lugar_nombre: e.lugar?.nombre ?? '',
      latitud: Number(e.lugar?.latitud ?? 0),
      longitud: Number(e.lugar?.longitud ?? 0),
    }));
  }
}
