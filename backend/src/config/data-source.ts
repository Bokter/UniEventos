import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Cargar variables de entorno (para el CLI de TypeORM)
config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'unieventos',
  // Especificamos dónde TypeORM debe buscar las entidades usando glob patterns
  entities: [join(__dirname, '..', '**', 'infrastructure', 'entities', '*.orm-entity.{ts,js}')],
  // Especificamos dónde TypeORM guardará/buscará las migraciones
  migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
  synchronize: false,
  logging: true,
});
