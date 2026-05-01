import { Body, Controller, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LugaresService } from '../application/services/lugares.service';
import { UpdateLugarDto } from '../application/dto/update-lugar.dto';

// DTO de Swagger — clase independiente para documentación
class CreateLugarSwaggerDto {
  @ApiProperty({ example: 'Bloque B' }) nombre: string;
  @ApiPropertyOptional({ example: 'Edificio principal de ingeniería' }) descripcion?: string;
  @ApiPropertyOptional({ example: 10.9878350 }) latitud?: number;
  @ApiPropertyOptional({ example: -74.7889120 }) longitud?: number;
}

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
  create(@Body() dto: CreateLugarSwaggerDto) {
    return this.lugaresService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Editar lugar y sus coordenadas GPS (admin)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLugarDto,
  ) {
    return this.lugaresService.update(id, dto);
  }
}
