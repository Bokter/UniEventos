import { IsDateString, IsNumber, IsString, Matches } from 'class-validator';

export class CreateEventoDto {
  @IsString()
  titulo: string;

  @IsString()
  descripcion: string;

  @IsDateString()
  fecha: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  hora_inicio: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  hora_fin: string;

  @IsNumber()
  categoria_id: number;

  @IsNumber()
  lugar_id: number;
}
