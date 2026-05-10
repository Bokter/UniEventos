import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { EventoOrmEntity } from '../../../eventos/infrastructure/entities/evento.orm-entity';
import { UsuarioOrmEntity } from '../../../auth/infrastructure/entities/usuario.orm-entity';

@Entity('transmisiones')
export class TransmisionOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => EventoOrmEntity)
  @JoinColumn({ name: 'evento_id' })
  evento: EventoOrmEntity;

  @ManyToOne(() => UsuarioOrmEntity)
  @JoinColumn({ name: 'usuario_id' })
  organizador: UsuarioOrmEntity;

  @Column({ type: 'text' })
  stream_url: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
