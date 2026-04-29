import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateLugarDto {
  @ApiProperty({ example: 'Bloque B' })
  @IsString()
  nombre: string;

  @ApiPropertyOptional({ example: 'Edificio principal de ingeniería' })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({ example: 10.9878350 })
  @IsNumber()
  @IsOptional()
  @Min(-90) @Max(90)
  latitud?: number;

  @ApiPropertyOptional({ example: -74.7889120 })
  @IsNumber()
  @IsOptional()
  @Min(-180) @Max(180)
  longitud?: number;
}