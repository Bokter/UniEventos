import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioOrmEntity } from '../auth/infrastructure/entities/usuario.orm-entity';
import { UsuarioAdminTypeormRepository } from './infrastructure/repositories/usuario-admin-typeorm.repository';
import { UsuariosService } from './application/services/usuarios.service';
import { UsuariosController } from './presentation/usuarios.controller';
import { USUARIO_ADMIN_REPOSITORY } from './domain/repositories/usuario-admin.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([UsuarioOrmEntity])],
  controllers: [UsuariosController],
  providers: [
    UsuariosService,
    {
      provide: USUARIO_ADMIN_REPOSITORY,
      useClass: UsuarioAdminTypeormRepository,
    },
  ],
})
export class UsuariosModule {}
