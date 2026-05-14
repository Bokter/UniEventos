// Entidad ORM de Categoría — infraestructura de categorías
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('categorias')
export class CategoriaOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nombre: string;

  @Column({ default: true })
  activa: boolean;
}
