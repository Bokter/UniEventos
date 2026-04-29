import { Controller, Get, Post, Body, Put, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { CategoriasService } from './categorias.service';

@ApiTags('categorias')
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todas las categorías activas' })
  findAllActivas() {
    return this.categoriasService.findAllActivas();
  }

  @Get('todas')
  @ApiOperation({ summary: 'Lista todas las categorías (admin)' })
  findAll() {
    return this.categoriasService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Crear categoría (admin)' })
  @ApiBody({ schema: { properties: { nombre: { type: 'string' } } } })
  create(@Body('nombre') nombre: string) {
    return this.categoriasService.create(nombre);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Editar o activar/desactivar categoría (admin)' })
  @ApiBody({ schema: { properties: { nombre: { type: 'string' }, activa: { type: 'boolean' } } } })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body('nombre') nombre?: string,
    @Body('activa') activa?: boolean,
  ) {
    return this.categoriasService.update(id, nombre, activa);
  }
}
