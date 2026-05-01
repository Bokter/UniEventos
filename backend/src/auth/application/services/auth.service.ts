import { Injectable, Inject, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { IUsuarioRepository } from '../../domain/repositories/usuario.repository.interface';
import { USUARIO_REPOSITORY } from '../../domain/repositories/usuario.repository.interface';
import { RolUsuario } from '../../domain/enums/rol-usuario.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(nombre_completo: string, email: string, password: string) {
    const existe = await this.usuarioRepository.findByEmail(email);
    if (existe) throw new ConflictException('El email ya está registrado');

    const password_hash = await bcrypt.hash(password, 10);
    const usuario = await this.usuarioRepository.create({
      nombre_completo,
      email,
      password_hash,
      rol: RolUsuario.MIEMBRO,
    });

    const { password_hash: _, ...resultado } = usuario;
    return resultado;
  }

  async login(email: string, password: string) {
    const usuario = await this.usuarioRepository.findByEmail(email);
    if (!usuario) throw new UnauthorizedException('Credenciales inválidas');

    const valido = await bcrypt.compare(password, usuario.password_hash);
    if (!valido) throw new UnauthorizedException('Credenciales inválidas');

    const payload = { sub: usuario.id, email: usuario.email, rol: usuario.rol };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      usuario: {
        id: usuario.id,
        nombre_completo: usuario.nombre_completo,
        email: usuario.email,
        rol: usuario.rol,
      },
    };
  }
}