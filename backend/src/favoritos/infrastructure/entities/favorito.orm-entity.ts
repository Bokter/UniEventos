// Entidad ORM de Favorito
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, Unique } from 'typeorm';
import { UsuarioOrmEntity } from '../../../auth/infrastructure/entities/usuario.orm-entity';
import { EventoOrmEntity } from '../../../eventos/infrastructure/entities/evento.orm-entity';

@Entity('favoritos')
@Unique(['usuario', 'evento']) // Un usuario no puede marcar el mismo evento dos veces
export class FavoritoOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UsuarioOrmEntity)
  @JoinColumn({ name: 'usuario_id' })
  usuario: UsuarioOrmEntity;

  @ManyToOne(() => EventoOrmEntity)
  @JoinColumn({ name: 'evento_id' })
  evento: EventoOrmEntity;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
