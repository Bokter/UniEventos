export interface ILugarRepository {
  findAll(): Promise<any[]>;
  findById(id: number): Promise<any | null>;
  create(data: any): Promise<any>;
  update(id: number, data: any): Promise<any | null>;
}

export const LUGAR_REPOSITORY = 'LUGAR_REPOSITORY';
