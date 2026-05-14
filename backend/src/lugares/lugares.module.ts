import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LugarOrmEntity } from './infrastructure/entities/lugar.orm-entity';
import { LugarTypeormRepository } from './infrastructure/repositories/lugar-typeorm.repository';
import { LugaresService } from './application/services/lugares.service';
import { LugaresController } from './presentation/lugares.controller';
import { LUGAR_REPOSITORY } from './domain/repositories/lugar.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([LugarOrmEntity])],
  controllers: [LugaresController],
  providers: [
    LugaresService,
    {
      provide: LUGAR_REPOSITORY,
      useClass: LugarTypeormRepository,
    },
  ],
  exports: [LugaresService],
})
export class LugaresModule {}