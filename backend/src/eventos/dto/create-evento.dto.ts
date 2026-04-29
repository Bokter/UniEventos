import { ApiProperty } from '@nestjs/swagger';

export class CreateEventoDto {
  @ApiProperty()
  titulo: string;

  @ApiProperty()
  descripcion: string;

  @ApiProperty()
  fecha: string;

  @ApiProperty()
  hora_inicio: string;

  @ApiProperty()
  hora_fin: string;

  @ApiProperty()
  categoria_id: number;

  @ApiProperty()
  lugar_id: number;
}
