import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoritoOrmEntity } from './infrastructure/entities/favorito.orm-entity';
import { FavoritoTypeormRepository } from './infrastructure/repositories/favorito-typeorm.repository';
import { FavoritosService } from './application/services/favoritos.service';
import { FavoritosController } from './presentation/favoritos.controller';
import { FAVORITO_REPOSITORY } from './domain/repositories/favorito.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([FavoritoOrmEntity])],
  controllers: [FavoritosController],
  providers: [
    FavoritosService,
    {
      provide: FAVORITO_REPOSITORY,
      useClass: FavoritoTypeormRepository,
    },
  ],
  exports: [FavoritosService],
})
export class FavoritosModule {}
