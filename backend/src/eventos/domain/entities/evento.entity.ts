// Entidad de dominio pura — NO depende de TypeORM, NestJS, ni ningún framework
import { EstadoEvento } from '../enums/estado-evento.enum';

export class Evento {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: EstadoEvento;
  observacion_admin: string | null;
  created_at: Date;
  updated_at: Date;

  // Relaciones representadas como IDs o entidades simples
  organizador_id: number;
  categoria_id: number;
  lugar_id: number;

  // Datos de relaciones cargadas (opcionales, para respuestas)
  organizador?: { id: number; nombre_completo: string; email: string };
  categoria?: { id: number; nombre: string };
  lugar?: { id: number; nombre: string; latitud: number; longitud: number };
}
