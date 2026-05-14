export interface ICategoriaRepository {
  findAllActivas(): Promise<any[]>;
  findAll(): Promise<any[]>;
  findById(id: number): Promise<any | null>;
  create(nombre: string): Promise<any>;
  save(categoria: any): Promise<any>;
}

export const CATEGORIA_REPOSITORY = 'CATEGORIA_REPOSITORY';
