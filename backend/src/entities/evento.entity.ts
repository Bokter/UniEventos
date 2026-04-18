import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from './usuario.entity';
import { Categoria } from './categoria.entity';
import { Lugar } from './lugar.entity';

export enum EstadoEvento {
  BORRADOR = 'borrador',
  PENDIENTE = 'pendiente',
  APROBADO = 'aprobado',
  RECHAZADO = 'rechazado',
  CANCELADO = 'cancelado',
}

@Entity('eventos')
export class Evento {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'organizador_id' })
  organizador: Usuario;

  @ManyToOne(() => Categoria)
  @JoinColumn({ name: 'categoria_id' })
  categoria: Categoria;

  @ManyToOne(() => Lugar)
  @JoinColumn({ name: 'lugar_id' })
  lugar: Lugar;

  @Column()
  titulo: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'time' })
  hora_inicio: string;

  @Column({ type: 'time' })
  hora_fin: string;

  @Column({ type: 'enum', enum: EstadoEvento, default: EstadoEvento.BORRADOR })
  estado: EstadoEvento;

  @Column({ type: 'text', nullable: true })
  observacion_admin: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}