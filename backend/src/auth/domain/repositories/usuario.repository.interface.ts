import { RolUsuario } from '../enums/rol-usuario.enum';

export interface UsuarioDomain {
  id: number;
  nombre_completo: string;
  email: string;
  password_hash: string;
  rol: RolUsuario;
  activo: boolean;
  created_at: Date;
}

export interface IUsuarioRepository {
  findByEmail(email: string): Promise<UsuarioDomain | null>;
  create(data: {
    nombre_completo: string;
    email: string;
    password_hash: string;
    rol: RolUsuario;
  }): Promise<UsuarioDomain>;
}

export const USUARIO_REPOSITORY = 'USUARIO_REPOSITORY';