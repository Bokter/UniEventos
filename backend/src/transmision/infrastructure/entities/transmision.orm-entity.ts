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

  @Column()
  url_enlace: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
