import { Controller, Get, Post, Body, Put, Patch, Delete, Param, Query, Req, ParseIntPipe, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiProperty, ApiBearerAuth } from '@nestjs/swagger';
import { EventosService } from '../application/services/eventos.service';
import { CreateEventoDto } from '../application/dto/create-evento.dto';
import { UpdateEventoDto } from '../application/dto/update-evento.dto';
import { EventoArDto } from '../application/dto/evento-ar.dto';
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../auth/infrastructure/decorators/roles.decorator';

@ApiTags('eventos')
@Controller('eventos')
export class EventosController {
  constructor(private readonly eventosService: EventosService) {}

  @Get()
  @ApiOperation({ summary: 'Lista eventos aprobados (filtros: categoria, fecha)' })
  findAll(@Query('categoria') categoria?: number, @Query('fecha') fecha?: string) {
    return this.eventosService.findAll(categoria, fecha);
  }

  @Get('ar')
  @ApiOperation({ summary: 'Eventos de hoy aprobados con coordenadas para AR' })
  async getEventosAR(): Promise<EventoArDto[]> {
    return this.eventosService.findEventosAR();
  }

  @Get('pendientes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lista eventos pendientes (solo admin)' })
  findPendientes() {
    return this.eventosService.findPendientes();
  }

  @Get('mis-eventos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizador', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar estado de mis eventos (organizador)' })
  findMisEventos(@Req() req: any) {
    return this.eventosService.findMisEventos(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un evento' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventosService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizador', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear evento (organizador)' })
  create(@Body() createEventoDto: CreateEventoDto, @Req() req: any) {
    return this.eventosService.create(createEventoDto, req.user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizador', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Editar evento en borrador o rechazado (organizador)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateEventoDto: UpdateEventoDto) {
    return this.eventosService.update(id, updateEventoDto);
  }

  @Patch(':id/enviar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizador', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enviar a revisión (organizador)' })
  enviarRevision(@Param('id', ParseIntPipe) id: number) {
    return this.eventosService.enviarRevision(id);
  }

  @Patch(':id/cancelar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizador', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancelar evento aprobado (organizador)' })
  cancelar(@Param('id', ParseIntPipe) id: number) {
    return this.eventosService.cancelar(id);
  }

  @Patch(':id/aprobar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Aprobar evento (admin)' })
  aprobar(@Param('id', ParseIntPipe) id: number) {
    return this.eventosService.aprobar(id);
  }

  @Patch(':id/rechazar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rechazar con observación (admin)' })
  @ApiBody({ schema: { properties: { observacion: { type: 'string' } } } })
  rechazar(@Param('id', ParseIntPipe) id: number, @Body('observacion') observacion: string) {
    return this.eventosService.rechazar(id, observacion);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('organizador')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar evento en borrador o cancelado (organizador)' })
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.eventosService.eliminar(id);
  }
}