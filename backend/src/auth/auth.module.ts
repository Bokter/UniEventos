import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsuarioOrmEntity } from './infrastructure/entities/usuario.orm-entity';
import { UsuarioTypeormRepository } from './infrastructure/repositories/usuario-typeorm.repository';
import { AuthService } from './application/services/auth.service';
import { AuthController } from './presentation/auth.controller';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { USUARIO_REPOSITORY } from './domain/repositories/usuario.repository.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsuarioOrmEntity]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev_secret_cambiar_en_produccion',
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: USUARIO_REPOSITORY,
      useClass: UsuarioTypeormRepository,
    },
  ],
  exports: [JwtModule],
})
export class AuthModule {}