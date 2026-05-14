import { Controller, Get, Post, Delete, Param, Req, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FavoritosService } from '../application/services/favoritos.service';
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../auth/infrastructure/decorators/roles.decorator';
import { RolUsuario } from '../../auth/domain/enums/rol-usuario.enum';

@ApiTags('favoritos')
@Controller('favoritos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FavoritosController {
  constructor(private readonly favoritosService: FavoritosService) {}

  @Get()
  @Roles(RolUsuario.MIEMBRO, RolUsuario.ORGANIZADOR)
  @ApiOperation({ summary: 'Lista favoritos del usuario autenticado' })
  findAll(@Req() req: any) {
    return this.favoritosService.findByUsuario(req.user.id);
  }

  @Post(':eventoId')
  @Roles(RolUsuario.MIEMBRO, RolUsuario.ORGANIZADOR)
  @ApiOperation({ summary: 'Agregar evento a favoritos' })
  agregar(@Param('eventoId', ParseIntPipe) eventoId: number, @Req() req: any) {
    return this.favoritosService.agregar(req.user.id, eventoId);
  }

  @Delete(':eventoId')
  @Roles(RolUsuario.MIEMBRO, RolUsuario.ORGANIZADOR)
  @ApiOperation({ summary: 'Eliminar evento de favoritos' })
  eliminar(@Param('eventoId', ParseIntPipe) eventoId: number, @Req() req: any) {
    return this.favoritosService.eliminar(req.user.id, eventoId);
  }

  @Get(':eventoId/interesados')
  @Roles(RolUsuario.ORGANIZADOR, RolUsuario.ADMIN)
  @ApiOperation({ summary: 'Obtiene los correos de los usuarios que marcaron un evento como favorito' })
  obtenerInteresados(@Param('eventoId', ParseIntPipe) eventoId: number) {
    return this.favoritosService.obtenerInteresados(eventoId);
  }
}
