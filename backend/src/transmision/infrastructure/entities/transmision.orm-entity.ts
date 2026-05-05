// Entidad ORM de Transmisión
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { EventoOrmEntity } from '../../../eventos/infrastructure/entities/evento.orm-entity';

@Entity('transmisiones')
export class TransmisionOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => EventoOrmEntity)
  @JoinColumn({ name: 'evento_id' })
  evento: EventoOrmEntity;

  @Column({ nullable: true })
  stream_id: string;

  @Column({ nullable: true })
  stream_key: string;

  @Column({ nullable: true })
  playback_id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
