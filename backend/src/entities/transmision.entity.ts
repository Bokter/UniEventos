import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Evento } from './evento.entity';

@Entity('transmisiones')
export class Transmision {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Evento)
  @JoinColumn({ name: 'evento_id' })
  evento: Evento;

  @Column()
  url_enlace: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}