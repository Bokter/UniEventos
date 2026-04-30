import { RolUsuario } from '../enums/rol-usuario.enum';

export interface IUsuarioRepository {
  findByEmail(email: string): Promise<any | null>;
  create(data: { nombre_completo: string; email: string; password_hash: string; rol: RolUsuario }): Promise<any>;
}

export const USUARIO_REPOSITORY = 'USUARIO_REPOSITORY';
