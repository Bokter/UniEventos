import { Evento } from '../../domain/entities/evento.entity';
import { EventoOrmEntity } from '../entities/evento.orm-entity';

export class EventoMapper {
  static toDomain(orm: EventoOrmEntity): Evento {
    const evento = new Evento();
    evento.id = orm.id;
    evento.titulo = orm.titulo;
    evento.descripcion = orm.descripcion;
    evento.fecha = orm.fecha;
    evento.hora_inicio = orm.hora_inicio;
    evento.hora_fin = orm.hora_fin;
    evento.estado = orm.estado;
    evento.observacion_admin = orm.observacion_admin;
    evento.created_at = orm.created_at;
    evento.updated_at = orm.updated_at;

    if (orm.organizador) {
      evento.organizador_id = orm.organizador.id;
      evento.organizador = {
        id: orm.organizador.id,
        nombre_completo: orm.organizador.nombre_completo,
        email: orm.organizador.email,
      };
    }
    if (orm.categoria) {
      evento.categoria_id = orm.categoria.id;
      evento.categoria = {
        id: orm.categoria.id,
        nombre: orm.categoria.nombre,
      };
    }
    if (orm.lugar) {
      evento.lugar_id = orm.lugar.id;
      evento.lugar = {
        id: orm.lugar.id,
        nombre: orm.lugar.nombre,
        latitud: orm.lugar.latitud,
        longitud: orm.lugar.longitud,
      };
    }

    return evento;
  }

  static toOrmPartial(domain: Partial<Evento>): Partial<EventoOrmEntity> {
    const orm: any = {};

    if (domain.titulo !== undefined) orm.titulo = domain.titulo;
    if (domain.descripcion !== undefined) orm.descripcion = domain.descripcion;
    if (domain.fecha !== undefined) orm.fecha = domain.fecha;
    if (domain.hora_inicio !== undefined) orm.hora_inicio = domain.hora_inicio;
    if (domain.hora_fin !== undefined) orm.hora_fin = domain.hora_fin;
    if (domain.estado !== undefined) orm.estado = domain.estado;
    if (domain.observacion_admin !== undefined) orm.observacion_admin = domain.observacion_admin;

    if (domain.organizador_id) orm.organizador = { id: domain.organizador_id };
    if (domain.categoria_id) orm.categoria = { id: domain.categoria_id };
    if (domain.lugar_id) orm.lugar = { id: domain.lugar_id };

    return orm;
  }
}
