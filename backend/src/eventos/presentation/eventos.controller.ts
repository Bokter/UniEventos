import { Controller, Get, Post, Body, Put, Patch, Param, Query, Req, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiProperty } from '@nestjs/swagger';
import { EventosService } from '../application/services/eventos.service';
import { CreateEventoDto } from '../application/dto/create-evento.dto';
import { UpdateEventoDto } from '../application/dto/update-evento.dto';
import { EventoArDto } from '../application/dto/evento-ar.dto';

// DTO de Swagger — extiende el DTO de aplicación y agrega metadata de documentación
class CreateEventoSwaggerDto {
  @ApiProperty({ example: 'Feria de ciencias' }) titulo: string;
  @ApiProperty({ example: 'Exposición de proyectos' }) descripcion: string;
  @ApiProperty({ example: '2025-04-29' }) fecha: string;
  @ApiProperty({ example: '09:00' }) hora_inicio: string;
  @ApiProperty({ example: '18:00' }) hora_fin: string;
  @ApiProperty({ example: 1 }) categoria_id: number;
  @ApiProperty({ example: 1 }) lugar_id: number;
}

@ApiTags('eventos')
@Controller('eventos')
export class EventosController {
  constructor(private readonly eventosService: EventosService) {}

  @Get()
  @ApiOperation({ summary: 'Lista eventos aprobados (filtros: categoria, fecha)' })
  findAll(@Query('categoria') categoria?: number, @Query('fecha') fecha?: string) {
    return this.eventosService.findAll(categoria, fecha);
  }

  @Get('pendientes')
  @ApiOperation({ summary: 'Lista eventos pendientes (solo admin)' })
  findPendientes() {
    return this.eventosService.findPendientes();
  }

  @Get('mis-eventos')
  @ApiOperation({ summary: 'Consultar estado de mis eventos (organizador)' })
  findMisEventos(@Req() req: any) {
    // TODO: Cambiar a req.user.id cuando el AuthGuard esté configurado
    const organizadorId = req.user?.id || 1;
    return this.eventosService.findMisEventos(organizadorId);
  }

  @Get('ar')
  @ApiOperation({ summary: 'Eventos de hoy aprobados con coordenadas para AR' })
  async getEventosAR(): Promise<EventoArDto[]> {
    return this.eventosService.findEventosAR();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un evento' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventosService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear evento (organizador)' })
  create(@Body() createEventoDto: CreateEventoSwaggerDto, @Req() req: any) {
    const organizadorId = req.user?.id || 1;
    return this.eventosService.create(createEventoDto, organizadorId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Editar evento en borrador o rechazado (organizador)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateEventoDto: UpdateEventoDto) {
    return this.eventosService.update(id, updateEventoDto);
  }

  @Patch(':id/enviar')
  @ApiOperation({ summary: 'Enviar a revisión (organizador)' })
  enviarRevision(@Param('id', ParseIntPipe) id: number) {
    return this.eventosService.enviarRevision(id);
  }

  @Patch(':id/cancelar')
  @ApiOperation({ summary: 'Cancelar evento aprobado (organizador)' })
  cancelar(@Param('id', ParseIntPipe) id: number) {
    return this.eventosService.cancelar(id);
  }

  @Patch(':id/aprobar')
  @ApiOperation({ summary: 'Aprobar evento (admin)' })
  aprobar(@Param('id', ParseIntPipe) id: number) {
    return this.eventosService.aprobar(id);
  }

  @Patch(':id/rechazar')
  @ApiOperation({ summary: 'Rechazar con observación (admin)' })
  @ApiBody({ schema: { properties: { observacion: { type: 'string' } } } })
  rechazar(@Param('id', ParseIntPipe) id: number, @Body('observacion') observacion: string) {
    return this.eventosService.rechazar(id, observacion);
  }
}
