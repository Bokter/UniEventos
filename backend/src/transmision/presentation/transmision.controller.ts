import { Controller, Post, Delete, Param, Body, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
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
  @ApiOperation({ summary: 'Registrar enlace de transmisión' })
  registrar(
    @Param('id', ParseIntPipe) eventoId: number,
    @Body('url') url: string,
    @Req() req: any
  ) {
    return this.transmisionService.registrar(eventoId, req.user.id, url);
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
