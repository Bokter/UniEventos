// Entidad ORM de Usuario — infraestructura de auth
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum RolUsuario {
  MIEMBRO = 'miembro',
  ORGANIZADOR = 'organizador',
  ADMIN = 'admin',
}

@Entity('usuarios')
export class UsuarioOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre_completo: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column({ type: 'enum', enum: RolUsuario, default: RolUsuario.MIEMBRO })
  rol: RolUsuario;

  @Column({ default: true })
  activo: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
