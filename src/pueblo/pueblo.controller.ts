import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PuebloService } from './pueblo.service';
import { CreatePuebloDto, UpdatePuebloDto } from './dto/pueblo.dto';
import { ValidateObjectidPipe } from 'src/common/validate-objectid/validate-objectid.pipe';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { colombiaJson } from './json/colombia';

@Controller('pueblo')
@UseGuards(JwtAuthGuard)
export class PuebloController {
  constructor(private readonly puebloService: PuebloService) {}
  @Post('/crear')
  async create(@Body() pueblo: CreatePuebloDto) {
    return await this.puebloService.create(pueblo);
  }
  @Get()
  async findAll() {
    return await this.puebloService.findAll();
  }
  @Get('/ubicacion')
  getDepartamentosyCiudades() {
    return colombiaJson;
  }

  @Get('/sinCobrador/:cobrador')
  async getRutasSinCobrador(@Param('cobrador') idCobrador: string) {
    return await this.puebloService.getRutasSinCobrador(idCobrador);
  }

  @Get('/:id')
  async findOne(@Param('id', ValidateObjectidPipe) id: string) {
    return await this.puebloService.findOne(id);
  }

  @Put('/actualizar')
  async update(@Body() puebloUpdate: UpdatePuebloDto) {
    return await this.puebloService.update(puebloUpdate);
  }

  @Delete('/:id')
  async remove(@Param('id', ValidateObjectidPipe) id: string) {
    return await this.puebloService.remove(id);
  }
}
