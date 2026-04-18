import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('categorias')
export class Categoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nombre: string;

  @Column({ default: true })
  activa: boolean;
}