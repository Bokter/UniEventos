// Puerto (interface) del repositorio — define QUÉ necesita el dominio, no CÓMO se implementa
import { Evento } from '../entities/evento.entity';

export interface IEventoRepository {
  findAllAprobados(categoriaId?: number, fecha?: string): Promise<Evento[]>;
  findById(id: number): Promise<Evento | null>;
  findPendientes(): Promise<Evento[]>;
  findByOrganizadorId(organizadorId: number): Promise<Evento[]>;
  findEventosHoyConCoordenadas(): Promise<Evento[]>;
  create(evento: Partial<Evento>): Promise<Evento>;
  save(evento: Evento): Promise<Evento>;
}

// Token de inyección de dependencias para NestJS
export const EVENTO_REPOSITORY = 'EVENTO_REPOSITORY';
