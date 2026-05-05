// Entidad ORM — solo para TypeORM, NO se usa en la capa de aplicación
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UsuarioOrmEntity } from '../../../auth/infrastructure/entities/usuario.orm-entity';
import { CategoriaOrmEntity } from '../../../categorias/infrastructure/entities/categoria.orm-entity';
import { LugarOrmEntity } from '../../../lugares/infrastructure/entities/lugar.orm-entity';
import { EstadoEvento } from '../../domain/enums/estado-evento.enum';

@Entity('eventos')
export class EventoOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UsuarioOrmEntity)
  @JoinColumn({ name: 'organizador_id' })
  organizador: UsuarioOrmEntity;

  @ManyToOne(() => CategoriaOrmEntity)
  @JoinColumn({ name: 'categoria_id' })
  categoria: CategoriaOrmEntity;

  @ManyToOne(() => LugarOrmEntity)
  @JoinColumn({ name: 'lugar_id' })
  lugar: LugarOrmEntity;

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
  observacion_admin: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
