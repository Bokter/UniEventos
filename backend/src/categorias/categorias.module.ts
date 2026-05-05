import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriaOrmEntity } from './infrastructure/entities/categoria.orm-entity';
import { CategoriaTypeormRepository } from './infrastructure/repositories/categoria-typeorm.repository';
import { CategoriasService } from './application/services/categorias.service';
import { CategoriasController } from './presentation/categorias.controller';
import { CATEGORIA_REPOSITORY } from './domain/repositories/categoria.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([CategoriaOrmEntity])],
  controllers: [CategoriasController],
  providers: [
    CategoriasService,
    {
      provide: CATEGORIA_REPOSITORY,
      useClass: CategoriaTypeormRepository,
    },
  ],
})
export class CategoriasModule {}
