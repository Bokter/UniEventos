import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('lugares')
export class Lugar {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'float' })
  latitud: number;

  @Column({ type: 'float' })
  longitud: number;
}