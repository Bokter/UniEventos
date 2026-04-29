import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsString, Matches } from 'class-validator';

export class CreateEventoDto {
  @ApiProperty({ example: 'Feria de ciencias' })
  @IsString()
  titulo: string;

  @ApiProperty({ example: 'Exposición de proyectos' })
  @IsString()
  descripcion: string;

  @ApiProperty({ example: '2025-04-29' })
  @IsDateString()
  fecha: string;

  @ApiProperty({ example: '09:00' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  hora_inicio: string;

  @ApiProperty({ example: '18:00' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  hora_fin: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  categoria_id: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  lugar_id: number;
}