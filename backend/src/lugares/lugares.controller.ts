import { Body, Controller, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LugaresService } from './lugares.service';
import { CreateLugarDto } from './dto/create-lugar.dto';
import { UpdateLugarDto } from './dto/update-lugar.dto';

@ApiTags('lugares')
@Controller('lugares')
export class LugaresController {
  constructor(private readonly lugaresService: LugaresService) {}

  @Get()
  @ApiOperation({ summary: 'Lista de lugares del campus' })
  findAll() {
    return this.lugaresService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Crear lugar (admin)' })
  create(@Body() dto: CreateLugarDto) {
    return this.lugaresService.create(dto);
  }

  // ✦ NUEVO — para cargar/editar coords desde Swagger o Postman
  @Put(':id')
  @ApiOperation({ summary: 'Editar lugar y sus coordenadas GPS (admin)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLugarDto,
  ) {
    return this.lugaresService.update(id, dto);
  }
}