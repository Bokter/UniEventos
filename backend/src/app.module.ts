import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Categoria } from './entities/categoria.entity';
import { Lugar } from './entities/lugar.entity';
import { Evento } from './entities/evento.entity';
import { Transmision } from './entities/transmision.entity';
import { Favorito } from './entities/favorito.entity';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'unieventos',
      entities: [Usuario, Categoria, Lugar, Evento, Transmision, Favorito],
      synchronize: true,
    }),
    AuthModule,
  ],
})
export class AppModule {}