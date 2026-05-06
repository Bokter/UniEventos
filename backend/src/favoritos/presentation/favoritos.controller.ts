import { Controller, Get, Post, Delete, Param, Req, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FavoritosService } from '../application/services/favoritos.service';
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard';

@ApiTags('favoritos')
@Controller('favoritos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoritosController {
  constructor(private readonly favoritosService: FavoritosService) {}

  @Get()
  @ApiOperation({ summary: 'Lista favoritos del usuario autenticado' })
  findAll(@Req() req: any) {
    return this.favoritosService.findByUsuario(req.user.id);
  }

  @Post(':eventoId')
  @ApiOperation({ summary: 'Agregar evento a favoritos' })
  agregar(@Param('eventoId', ParseIntPipe) eventoId: number, @Req() req: any) {
    return this.favoritosService.agregar(req.user.id, eventoId);
  }

  @Delete(':eventoId')
  @ApiOperation({ summary: 'Eliminar evento de favoritos' })
  eliminar(@Param('eventoId', ParseIntPipe) eventoId: number, @Req() req: any) {
    return this.favoritosService.eliminar(req.user.id, eventoId);
  }
}
