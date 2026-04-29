import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventosService } from './eventos.service';
import { EventosController } from './eventos.controller';
import { Evento } from '../entities/evento.entity';
import { Lugar } from '../entities/lugar.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Evento, Lugar])],
  controllers: [EventosController], 
  providers: [EventosService],
  exports: [EventosService],
})
export class EventosModule {}