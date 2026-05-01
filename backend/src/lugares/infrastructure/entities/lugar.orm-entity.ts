// Entidad ORM de Lugar — infraestructura de lugares
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('lugares')
export class LugarOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitud: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitud: number;
}
