import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Usuario } from './usuario.entity';
import { Evento } from './evento.entity';

@Entity('favoritos')
export class Favorito {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @ManyToOne(() => Evento)
  @JoinColumn({ name: 'evento_id' })
  evento: Evento;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}