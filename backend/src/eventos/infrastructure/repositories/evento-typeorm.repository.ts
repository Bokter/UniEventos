import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IEventoRepository } from '../../domain/repositories/evento.repository.interface';
import { Evento } from '../../domain/entities/evento.entity';
import { EstadoEvento } from '../../domain/enums/estado-evento.enum';
import { EventoOrmEntity } from '../entities/evento.orm-entity';
import { EventoMapper } from '../mappers/evento.mapper';

@Injectable()
export class EventoTypeormRepository implements IEventoRepository {
  constructor(
    @InjectRepository(EventoOrmEntity)
    private readonly repo: Repository<EventoOrmEntity>,
  ) {}

  async findAllAprobados(categoriaId?: number, fecha?: string): Promise<Evento[]> {
    const query = this.repo.createQueryBuilder('evento')
      .leftJoinAndSelect('evento.categoria', 'categoria')
      .leftJoinAndSelect('evento.lugar', 'lugar')
      .leftJoinAndSelect('evento.organizador', 'organizador')
      .where('evento.estado = :estado', { estado: EstadoEvento.APROBADO });

    if (categoriaId) {
      query.andWhere('evento.categoria_id = :categoriaId', { categoriaId });
    }
    if (fecha) {
      query.andWhere('evento.fecha = :fecha', { fecha });
    }

    const orms = await query.getMany();
    return orms.map(EventoMapper.toDomain);
  }

  async findById(id: number): Promise<Evento | null> {
    const orm = await this.repo.findOne({
      where: { id },
      relations: ['categoria', 'lugar', 'organizador'],
    });
    return orm ? EventoMapper.toDomain(orm) : null;
  }

  async findPendientes(): Promise<Evento[]> {
    const orms = await this.repo.find({
      where: { estado: EstadoEvento.PENDIENTE },
      relations: ['categoria', 'lugar', 'organizador'],
    });
    return orms.map(EventoMapper.toDomain);
  }

  async findByOrganizadorId(organizadorId: number): Promise<Evento[]> {
    const orms = await this.repo.find({
      where: { organizador: { id: organizadorId } },
      relations: ['categoria', 'lugar'],
      order: { created_at: 'DESC' },
    });
    return orms.map(EventoMapper.toDomain);
  }

  async findEventosHoyConCoordenadas(): Promise<Evento[]> {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const orms = await this.repo.createQueryBuilder('e')
      .innerJoinAndSelect('e.lugar', 'l')
      .where('e.fecha >= :hoy AND e.fecha < :manana', { hoy, manana })
      .andWhere('e.estado = :estado', { estado: EstadoEvento.APROBADO })
      .andWhere('l.latitud IS NOT NULL')
      .getMany();

    return orms.map(EventoMapper.toDomain);
  }

  async create(eventoData: Partial<Evento>): Promise<Evento> {
    const ormData = EventoMapper.toOrmPartial(eventoData);
    const orm = this.repo.create(ormData);
    const saved = await this.repo.save(orm);

    // Recargar con relaciones
    const full = await this.repo.findOne({
      where: { id: saved.id },
      relations: ['categoria', 'lugar', 'organizador'],
    });
    return EventoMapper.toDomain(full!);
  }

  async save(evento: Evento): Promise<Evento> {
    const ormData = EventoMapper.toOrmPartial(evento);
    (ormData as any).id = evento.id;
    const saved = await this.repo.save(ormData);

    const full = await this.repo.findOne({
      where: { id: saved.id },
      relations: ['categoria', 'lugar', 'organizador'],
    });
    return EventoMapper.toDomain(full!);
  }
}
