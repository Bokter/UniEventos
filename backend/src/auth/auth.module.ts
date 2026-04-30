import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioOrmEntity } from './infrastructure/entities/usuario.orm-entity';
import { UsuarioTypeormRepository } from './infrastructure/repositories/usuario-typeorm.repository';
import { AuthService } from './application/services/auth.service';
import { AuthController } from './presentation/auth.controller';
import { USUARIO_REPOSITORY } from './domain/repositories/usuario.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([UsuarioOrmEntity])],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: USUARIO_REPOSITORY,
      useClass: UsuarioTypeormRepository,
    },
  ],
})
export class AuthModule {}