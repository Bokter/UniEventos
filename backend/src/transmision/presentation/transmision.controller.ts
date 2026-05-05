import { Controller, Post, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { TransmisionService } from '../application/services/transmision.service';

@ApiTags('transmision')
@Controller('eventos')
export class TransmisionController {
  constructor(private readonly transmisionService: TransmisionService) {}

  @Post(':id/stream')
  @ApiOperation({ summary: 'Iniciar Transmisión en Vivo (llama a Mux)' })
  registrar(
    @Param('id', ParseIntPipe) eventoId: number,
  ) {
    return this.transmisionService.registrar(eventoId);
  }

  @Delete(':id/stream')
  @ApiOperation({ summary: 'Eliminar enlace de transmisión (organizador)' })
  eliminar(@Param('id', ParseIntPipe) eventoId: number) {
    return this.transmisionService.eliminar(eventoId);
  }
}
