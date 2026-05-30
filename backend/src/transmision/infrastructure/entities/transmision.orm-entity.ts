import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { EventoOrmEntity } from '../../../eventos/infrastructure/entities/evento.orm-entity';
import { UsuarioOrmEntity } from '../../../auth/infrastructure/entities/usuario.orm-entity';

export type TransmisionEstado = 'idle' | 'live' | 'ended';

@Entity('transmisiones')
export class TransmisionOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => EventoOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'evento_id' })
  evento: EventoOrmEntity;

  @ManyToOne(() => UsuarioOrmEntity)
  @JoinColumn({ name: 'usuario_id' })
  organizador: UsuarioOrmEntity;

  /** Room ID de VideoSDK */
  @Column({ type: 'varchar', length: 255, nullable: true })
  meeting_id: string | null;

  /** URL externa para la transmisión (YouTube, Twitch, etc.) */
  @Column({ type: 'text', nullable: true })
  stream_url: string | null;

  /** URL HLS para los espectadores (la genera VideoSDK cuando el host inicia HLS) */
  @Column({ type: 'text', nullable: true })
  hls_url: string | null;

  /** Estado de la transmisión */
  @Column({
    type: 'varchar',
    length: 20,
    default: 'idle',
  })
  estado: TransmisionEstado;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
