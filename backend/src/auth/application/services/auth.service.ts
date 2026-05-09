import { Injectable, Inject, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { IUsuarioRepository } from '../../domain/repositories/usuario.repository.interface';
import { USUARIO_REPOSITORY } from '../../domain/repositories/usuario.repository.interface';
import { RolUsuario } from '../../domain/enums/rol-usuario.enum';
import * as bcrypt from 'bcrypt';

const ROBLE_BASE = 'https://roble-api.openlab.uninorte.edu.co/auth/unieventos_f90d41b197';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly jwtService: JwtService,
  ) { }

  private readonly ADMIN_EMAILS = [
    'fatimac@uninorte.edu.co',
    'rojasdelahoz@uninorte.edu.co',
  ];

  // ─── VISITANTES (cualquier correo que NO sea @uninorte.edu.co) ───────────────

  async register(nombre_completo: string, email: string, password: string) {
    if (email.endsWith('@uninorte.edu.co')) {
      throw new ConflictException('Los correos Uninorte deben registrarse con /auth/register-uninorte');
    }

    const existe = await this.usuarioRepository.findByEmail(email);
    if (existe) throw new ConflictException('El email ya está registrado');

    const password_hash = await bcrypt.hash(password, 10);
    const usuario = await this.usuarioRepository.create({
      nombre_completo,
      email,
      password_hash,
      rol: RolUsuario.MIEMBRO,
    });

    const token = this.generarToken(usuario);
    return { access_token: token, usuario: this.formatearUsuario(usuario) };
  }

  async login(email: string, password: string) {
    if (email.endsWith('@uninorte.edu.co')) {
      throw new UnauthorizedException('Los usuarios Uninorte deben usar /auth/login-uninorte');
    }

    const usuario = await this.usuarioRepository.findByEmail(email);
    if (!usuario) throw new UnauthorizedException('Credenciales inválidas');

    const valido = await bcrypt.compare(password, usuario.password_hash);
    if (!valido) throw new UnauthorizedException('Credenciales inválidas');

    const token = this.generarToken(usuario);
    return { access_token: token, usuario: this.formatearUsuario(usuario) };
  }

  // ─── COMUNIDAD UNINORTE (@uninorte.edu.co via Roble) ─────────────────────────

  async registerUninorte(nombre_completo: string, email: string, password: string) {
    if (!email.endsWith('@uninorte.edu.co')) {
      throw new ConflictException('Este endpoint es solo para correos @uninorte.edu.co');
    }

    // 1. Registrar en Roble (envía código de verificación al correo)
    const robleRes = await fetch(`${ROBLE_BASE}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name: nombre_completo }),
    });

    if (!robleRes.ok) {
      const error = await robleRes.json();
      throw new ConflictException(error?.message || 'Error al registrar en Roble');
    }

    // 2. Guardar en la BD local como ORGANIZADOR
    const existe = await this.usuarioRepository.findByEmail(email);
    if (!existe) {
      const password_hash = await bcrypt.hash(password, 10);
      await this.usuarioRepository.create({
        nombre_completo,
        email,
        password_hash,
        rol: this.ADMIN_EMAILS.includes(email) ? RolUsuario.ADMIN : RolUsuario.ORGANIZADOR,
      });
    }

    return { mensaje: 'Registro exitoso. Revisa tu correo Uninorte para verificar tu cuenta.' };
  }

  async verifyEmail(email: string, code: string) {
    console.log('--- verifyEmail SERVICE ---');
    console.log(`Enviando a Roble -> email: "${email}", code: "${code}"`);
    // Verificar el código en Roble
    const robleRes = await fetch(`${ROBLE_BASE}/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    if (!robleRes.ok) {
      const errorData = await robleRes.json().catch(() => ({}));
      console.error('Error de Verificación en Roble:', robleRes.status, errorData);
      throw new UnauthorizedException('Código de verificación inválido o expirado');
    }

    return { mensaje: 'Correo verificado exitosamente. Ya puedes iniciar sesión.' };
  }

  async resendCode(email: string) {
    const robleRes = await fetch(`${ROBLE_BASE}/resend-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!robleRes.ok) {
      throw new UnauthorizedException('No se pudo reenviar el código. Intenta de nuevo.');
    }

    return { mensaje: 'Se ha reenviado un nuevo código de verificación al correo.' };
  }

  async loginUninorte(email: string, password: string) {
    if (!email.endsWith('@uninorte.edu.co')) {
      throw new UnauthorizedException('Este endpoint es solo para correos @uninorte.edu.co');
    }

    // 1. Autenticar contra Roble
    const robleRes = await fetch(`${ROBLE_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!robleRes.ok) {
      const error = await robleRes.json().catch(() => ({}));
      console.error('Error de Login en Roble:', error);
      throw new UnauthorizedException(error?.message || 'Credenciales Uninorte inválidas');
    }

    // 2. Buscar o crear usuario local
    let usuario = await this.usuarioRepository.findByEmail(email);
    if (!usuario) {
      // Primera vez que inicia sesión — crear en BD local automáticamente
      const password_hash = await bcrypt.hash(password, 10);
      usuario = await this.usuarioRepository.create({
        nombre_completo: email.split('@')[0],
        email,
        password_hash,
        rol: this.ADMIN_EMAILS.includes(email) ? RolUsuario.ADMIN : RolUsuario.ORGANIZADOR,
      });
    }

    // 3. Verificar si debe ser promovido a ADMIN (si estaba como organizador y ahora está en la lista)
    console.log(`Verificando admin para: ${email}. Rol actual: ${usuario.rol}`);
    if (this.ADMIN_EMAILS.includes(email) && usuario.rol !== RolUsuario.ADMIN) {
      console.log(`¡Promoviendo a ADMIN a: ${email}!`);
      usuario.rol = RolUsuario.ADMIN;
      await this.usuarioRepository.update(usuario.id, { rol: RolUsuario.ADMIN });
    }

    // 4. Generar nuestro propio JWT
    const token = this.generarToken(usuario);
    return { access_token: token, usuario: this.formatearUsuario(usuario) };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  private generarToken(usuario: any) {
    return this.jwtService.sign({
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    });
  }

  private formatearUsuario(usuario: any) {
    return {
      id: usuario.id,
      nombre_completo: usuario.nombre_completo,
      email: usuario.email,
      rol: usuario.rol,
    };
  }
}