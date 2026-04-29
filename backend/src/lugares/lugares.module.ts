import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LugaresController } from './lugares.controller';
import { LugaresService } from './lugares.service';
import { Lugar } from '../entities/lugar.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lugar])],
  controllers: [LugaresController],
  providers: [LugaresService],
})
export class LugaresModule {}
