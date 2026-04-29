import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lugar } from '../entities/lugar.entity';
import { LugaresController } from './lugares.controller';
import { LugaresService } from './lugares.service';

@Module({
  imports: [TypeOrmModule.forFeature([Lugar])],
  controllers: [LugaresController],
  providers: [LugaresService],
  exports: [LugaresService], // ← necesario para que EventosModule lo use después
})
export class LugaresModule {}