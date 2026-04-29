import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Evento } from './evento.entity';

@Entity('lugares')
export class Lugar {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitud: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitud: number;

  @OneToMany(() => Evento, (evento) => evento.lugar)
  eventos: Evento[];
}