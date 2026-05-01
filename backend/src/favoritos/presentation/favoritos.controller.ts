import { Controller, Get, Post, Delete, Param, Req, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FavoritosService } from '../application/services/favoritos.service';

@ApiTags('favoritos')
@Controller('favoritos')
export class FavoritosController {
  constructor(private readonly favoritosService: FavoritosService) {}

  @Get()
  @ApiOperation({ summary: 'Lista favoritos del usuario autenticado' })
  findAll(@Req() req: any) {
    // TODO: Cambiar a req.user.id cuando el AuthGuard esté configurado
    const usuarioId = req.user?.id || 1;
    return this.favoritosService.findByUsuario(usuarioId);
  }

  @Post(':eventoId')
  @ApiOperation({ summary: 'Agregar evento a favoritos' })
  agregar(@Param('eventoId', ParseIntPipe) eventoId: number, @Req() req: any) {
    const usuarioId = req.user?.id || 1;
    return this.favoritosService.agregar(usuarioId, eventoId);
  }

  @Delete(':eventoId')
  @ApiOperation({ summary: 'Eliminar evento de favoritos' })
  eliminar(@Param('eventoId', ParseIntPipe) eventoId: number, @Req() req: any) {
    const usuarioId = req.user?.id || 1;
    return this.favoritosService.eliminar(usuarioId, eventoId);
  }
}
