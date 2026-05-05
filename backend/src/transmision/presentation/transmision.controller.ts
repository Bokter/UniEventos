import { Controller, Post, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { TransmisionService } from '../application/services/transmision.service';

// DTO de Swagger para documentación
class CreateTransmisionSwaggerDto {
  @ApiProperty({ example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })
  url_enlace: string;
}

@ApiTags('transmision')
@Controller('eventos')
export class TransmisionController {
  constructor(private readonly transmisionService: TransmisionService) {}

  @Post(':id/stream')
  @ApiOperation({ summary: 'Registrar enlace de transmisión en vivo (organizador)' })
  registrar(
    @Param('id', ParseIntPipe) eventoId: number,
    @Body() dto: CreateTransmisionSwaggerDto,
  ) {
    return this.transmisionService.registrar(eventoId, dto.url_enlace);
  }

  @Delete(':id/stream')
  @ApiOperation({ summary: 'Eliminar enlace de transmisión (organizador)' })
  eliminar(@Param('id', ParseIntPipe) eventoId: number) {
    return this.transmisionService.eliminar(eventoId);
  }
}
