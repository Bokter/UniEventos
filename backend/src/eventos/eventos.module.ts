import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventoOrmEntity } from './infrastructure/entities/evento.orm-entity';
import { EventoTypeormRepository } from './infrastructure/repositories/evento-typeorm.repository';
import { EventosService } from './application/services/eventos.service';
import { EventosController } from './presentation/eventos.controller';
import { EVENTO_REPOSITORY } from './domain/repositories/evento.repository.interface';
import { FavoritosModule } from '../favoritos/favoritos.module';

@Module({
  imports: [TypeOrmModule.forFeature([EventoOrmEntity]), FavoritosModule],
  controllers: [EventosController],
  providers: [
    EventosService,
    {
      // Inversión de dependencias: el token del dominio se conecta con la implementación real
      provide: EVENTO_REPOSITORY,
      useClass: EventoTypeormRepository,
    },
  ],
  exports: [EventosService],
})
export class EventosModule {}