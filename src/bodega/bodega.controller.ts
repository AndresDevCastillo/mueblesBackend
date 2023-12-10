import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BodegaService } from './bodega.service';
import { CreateBodegaDto } from './dto/bodega.dto';
import { ValidateObjectidPipe } from 'src/common/validate-objectid/validate-objectid.pipe';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';

@Controller('bodega')
@UseGuards(JwtAuthGuard)
export class BodegaController {
  constructor(private readonly bodegaService: BodegaService) {}

  @Post('/crear')
  async create(@Body() createBodegaDto: CreateBodegaDto) {
    return await this.bodegaService.create(createBodegaDto);
  }

  @Get()
  async findAll() {
    return await this.bodegaService.findAll();
  }

  @Get('/:id')
  async findOne(@Param('id', ValidateObjectidPipe) id: string) {
    return await this.bodegaService.findOne(id);
  }

  @Delete('/:id')
  async remove(@Param('id', ValidateObjectidPipe) id: string) {
    return await this.bodegaService.remove(id);
  }
}
