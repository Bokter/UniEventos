import { Controller, Post, Get, Put, Delete, Param, Body, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TransmisionService } from '../application/services/transmision.service';
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard';

@ApiTags('transmision')
@Controller('eventos')
export class TransmisionController {
  constructor(private readonly transmisionService: TransmisionService) {}

  @Post(':id/stream')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Iniciar transmisión con VideoSDK o enlace externo' })
  iniciar(
    @Param('id', ParseIntPipe) eventoId: number,
    @Req() req: any,
    @Body('url') url?: string
  ) {
    return this.transmisionService.iniciarTransmision(eventoId, req.user.id, url);
  }

  @Get(':id/stream/token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener token de VideoSDK para la sala de transmisión' })
  obtenerToken(
    @Param('id', ParseIntPipe) eventoId: number,
    @Req() req: any
  ) {
    return this.transmisionService.obtenerToken(eventoId, req.user.id);
  }

  @Put(':id/stream/estado')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar estado de la transmisión' })
  actualizarEstado(
    @Param('id', ParseIntPipe) eventoId: number,
    @Req() req: any,
    @Body('estado') estado: 'idle' | 'live' | 'ended',
    @Body('hlsUrl') hlsUrl?: string | null,
  ) {
    return this.transmisionService.actualizarEstado(
      eventoId,
      req.user.id,
      estado,
      hlsUrl,
    );
  }

  @Delete(':id/stream')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar enlace de transmisión' })
  eliminar(
    @Param('id', ParseIntPipe) eventoId: number,
    @Req() req: any
  ) {
    return this.transmisionService.eliminar(eventoId, req.user.id);
  }
}
