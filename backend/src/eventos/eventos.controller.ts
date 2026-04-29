import { Controller, Get, Post, Body, Put, Patch, Param, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { EventosService } from './eventos.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { EventoArDto } from './dto/evento-ar.dto';

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
    // Simulamos ID de organizador por ahora (asumiendo ID=1). 
    // Luego se cambiará a req.user.id cuando el AuthGuard esté configurado
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
  findOne(@Param('id') id: string) {
    return this.eventosService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear evento (organizador)' })
  create(@Body() createEventoDto: CreateEventoDto, @Req() req: any) {
    // Simulamos ID de organizador por ahora (asumiendo ID=1). 
    // Luego se cambiará a req.user.id cuando el AuthGuard esté configurado
    const organizadorId = req.user?.id || 1; 
    return this.eventosService.create(createEventoDto, organizadorId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Editar evento en borrador o rechazado (organizador)' })
  update(@Param('id') id: string, @Body() updateEventoDto: UpdateEventoDto) {
    return this.eventosService.update(+id, updateEventoDto);
  }

  @Patch(':id/enviar')
  @ApiOperation({ summary: 'Enviar a revisión (organizador)' })
  enviarRevision(@Param('id') id: string) {
    return this.eventosService.enviarRevision(+id);
  }

  @Patch(':id/cancelar')
  @ApiOperation({ summary: 'Cancelar evento aprobado (organizador)' })
  cancelar(@Param('id') id: string) {
    return this.eventosService.cancelar(+id);
  }

  @Patch(':id/aprobar')
  @ApiOperation({ summary: 'Aprobar evento (admin)' })
  aprobar(@Param('id') id: string) {
    return this.eventosService.aprobar(+id);
  }

  @Patch(':id/rechazar')
  @ApiOperation({ summary: 'Rechazar con observación (admin)' })
  @ApiBody({ schema: { properties: { observacion: { type: 'string' } } } })
  rechazar(@Param('id') id: string, @Body('observacion') observacion: string) {
    return this.eventosService.rechazar(+id, observacion);
  }
}
