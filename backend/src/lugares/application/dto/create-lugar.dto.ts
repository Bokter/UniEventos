import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateLugarDto {
  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @IsOptional()
  @Min(-90) @Max(90)
  latitud?: number;

  @IsNumber()
  @IsOptional()
  @Min(-180) @Max(180)
  longitud?: number;
}
