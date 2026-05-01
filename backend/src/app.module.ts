import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { EventosModule } from './eventos/eventos.module';
import { CategoriasModule } from './categorias/categorias.module';
import { LugaresModule } from './lugares/lugares.module';
import { FavoritosModule } from './favoritos/favoritos.module';
import { TransmisionModule } from './transmision/transmision.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';

// Importar entidades ORM desde la capa de infraestructura de cada módulo
import { UsuarioOrmEntity } from './auth/infrastructure/entities/usuario.orm-entity';
import { CategoriaOrmEntity } from './categorias/infrastructure/entities/categoria.orm-entity';
import { LugarOrmEntity } from './lugares/infrastructure/entities/lugar.orm-entity';
import { EventoOrmEntity } from './eventos/infrastructure/entities/evento.orm-entity';
import { FavoritoOrmEntity } from './favoritos/infrastructure/entities/favorito.orm-entity';
import { TransmisionOrmEntity } from './transmision/infrastructure/entities/transmision.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'unieventos',
      entities: [
        UsuarioOrmEntity,
        CategoriaOrmEntity,
        LugarOrmEntity,
        EventoOrmEntity,
        FavoritoOrmEntity,
        TransmisionOrmEntity,
      ],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    AuthModule,
    EventosModule,
    CategoriasModule,
    LugaresModule,
    FavoritosModule,
    TransmisionModule,
    UsuariosModule,
    NotificacionesModule,
  ],
})
export class AppModule {}