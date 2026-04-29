import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LugaresService } from './lugares.service';

@ApiTags('lugares')
@Controller('lugares')
export class LugaresController {
  constructor(private readonly lugaresService: LugaresService) {}

  @Get()
  @ApiOperation({ summary: 'Lista de lugares del campus para publicar o ver eventos' })
  findAll() {
    return this.lugaresService.findAll();
  }
}
