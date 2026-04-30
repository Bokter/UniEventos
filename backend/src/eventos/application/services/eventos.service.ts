import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { EstadoEvento } from '../../domain/enums/estado-evento.enum';
import type { IEventoRepository } from '../../domain/repositories/evento.repository.interface';
import { EVENTO_REPOSITORY } from '../../domain/repositories/evento.repository.interface';
import { CreateEventoDto } from '../dto/create-evento.dto';
import { UpdateEventoDto } from '../dto/update-evento.dto';
import { EventoArDto } from '../dto/evento-ar.dto';
import { NotificacionesService } from '../../../notificaciones/application/services/notificaciones.service';
import { FavoritosService } from '../../../favoritos/application/services/favoritos.service';

@Injectable()
export class EventosService {
  constructor(
    @Inject(EVENTO_REPOSITORY)
    private readonly eventoRepository: IEventoRepository,
    private readonly notificacionesService: NotificacionesService,
    private readonly favoritosService: FavoritosService,
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
    const actualizado = await this.eventoRepository.save(evento);

    // RF-22: Notificar a interesados sobre la actualización
    const interesados = await this.favoritosService.obtenerInteresados(id);
    if (interesados.length > 0) {
      await this.notificacionesService.notificarActualizacionAInteresados(interesados, actualizado.titulo);
    }

    return actualizado;
  }

  async enviarRevision(id: number) {
    const evento = await this.findOne(id);
    evento.estado = EstadoEvento.PENDIENTE;
    return this.eventoRepository.save(evento);
  }

  async cancelar(id: number) {
    const evento = await this.findOne(id);
    evento.estado = EstadoEvento.CANCELADO;
    const guardado = await this.eventoRepository.save(evento);

    // RF-21: Notificar a interesados sobre la cancelación
    const interesados = await this.favoritosService.obtenerInteresados(id);
    if (interesados.length > 0) {
      await this.notificacionesService.notificarCancelacionAInteresados(interesados, guardado.titulo);
    }

    return guardado;
  }

  async aprobar(id: number) {
    const evento = await this.findOne(id);
    evento.estado = EstadoEvento.APROBADO;
    evento.observacion_admin = null;
    const guardado = await this.eventoRepository.save(evento);

    // RF-20: Notificar al organizador
    if (guardado.organizador?.email) {
      await this.notificacionesService.notificarCambioEstadoEvento(
        guardado.organizador.email,
        guardado.titulo,
        'APROBADO'
      );
    }

    return guardado;
  }

  async rechazar(id: number, observacion: string) {
    const evento = await this.findOne(id);
    evento.estado = EstadoEvento.RECHAZADO;
    evento.observacion_admin = observacion;
    const guardado = await this.eventoRepository.save(evento);

    // RF-20: Notificar al organizador con la observación
    if (guardado.organizador?.email) {
      await this.notificacionesService.notificarCambioEstadoEvento(
        guardado.organizador.email,
        guardado.titulo,
        'RECHAZADO',
        observacion
      );
    }

    return guardado;
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
