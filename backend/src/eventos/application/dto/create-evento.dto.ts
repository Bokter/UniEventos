import { IsDateString, IsNumber, IsOptional, IsString, Matches, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CoorganizadorDto {
  @IsNumber()
  id: number;
}

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

  @IsString()
  @IsOptional()
  imagen_portada?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CoorganizadorDto)
  coorganizadores?: CoorganizadorDto[];
}
