import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario, RolUsuario } from '../entities/usuario.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async register(nombre_completo: string, email: string, password: string) {
    const existe = await this.usuarioRepo.findOneBy({ email });
    if (existe) throw new ConflictException('El email ya está registrado');

    const password_hash = await bcrypt.hash(password, 10);
    const usuario = this.usuarioRepo.create({
      nombre_completo,
      email,
      password_hash,
      rol: RolUsuario.MIEMBRO,
    });
    const guardado = await this.usuarioRepo.save(usuario);
    const { password_hash: _, ...resultado } = guardado;
    return resultado;
  }

  async login(email: string, password: string) {
    const usuario = await this.usuarioRepo.findOneBy({ email });
    if (!usuario) throw new UnauthorizedException('Credenciales inválidas');

    const valido = await bcrypt.compare(password, usuario.password_hash);
    if (!valido) throw new UnauthorizedException('Credenciales inválidas');

    const { password_hash: _, ...resultado } = usuario;
    return { mensaje: 'Login exitoso', usuario: resultado };
  }
}