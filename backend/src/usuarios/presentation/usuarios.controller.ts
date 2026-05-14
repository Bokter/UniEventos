import { Controller, Get, Patch, Param, Body, ParseIntPipe, UseGuards, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UsuariosService } from '../application/services/usuarios.service';
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../auth/infrastructure/decorators/roles.decorator';

@ApiTags('usuarios')
@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todos los usuarios (admin)' })
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un usuario (admin)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  @Patch(':id/activar')
  @ApiOperation({ summary: 'Activar cuenta de usuario (admin)' })
  activar(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.activar(id);
  }

  @Patch(':id/desactivar')
  @ApiOperation({ summary: 'Desactivar cuenta de usuario (admin)' })
  desactivar(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.desactivar(id);
  }

  @Patch(':id/rol')
  @ApiOperation({ summary: 'Cambiar rol de usuario (admin)' })
  @ApiBody({ schema: { properties: { rol: { type: 'string', enum: ['miembro', 'organizador', 'admin'] } } } })
  cambiarRol(
    @Param('id', ParseIntPipe) id: number,
    @Body('rol') rol: string,
  ) {
    return this.usuariosService.cambiarRol(id, rol);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar usuario permanentemente (admin)' })
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.eliminar(id);
  }
}
