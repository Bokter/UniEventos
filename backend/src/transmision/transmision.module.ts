import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransmisionOrmEntity } from './infrastructure/entities/transmision.orm-entity';
import { TransmisionTypeormRepository } from './infrastructure/repositories/transmision-typeorm.repository';
import { TransmisionService } from './application/services/transmision.service';
import { TransmisionController } from './presentation/transmision.controller';
import { TRANSMISION_REPOSITORY } from './domain/repositories/transmision.repository.interface';
import { MUX_SERVICE } from './domain/services/mux.service.interface';
import { MuxNodeService } from './infrastructure/services/mux-node.service';

@Module({
  imports: [TypeOrmModule.forFeature([TransmisionOrmEntity])],
  controllers: [TransmisionController],
  providers: [
    TransmisionService,
    {
      provide: TRANSMISION_REPOSITORY,
      useClass: TransmisionTypeormRepository,
    },
    {
      provide: MUX_SERVICE,
      useClass: MuxNodeService,
    },
  ],
})
export class TransmisionModule {}
