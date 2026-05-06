export interface IUsuarioAdminRepository {
  findAll(): Promise<any[]>;
  findById(id: number): Promise<any | null>;
  updateActivo(id: number, activo: boolean): Promise<any>;
  updateRol(id: number, rol: string): Promise<any>;
}

export const USUARIO_ADMIN_REPOSITORY = 'USUARIO_ADMIN_REPOSITORY';
