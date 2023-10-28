import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { PrestamoService } from './prestamo.service';
import { CreatePrestamoDto } from './dto/prestamo.dto';

@Controller('prestamo')
export class PrestamoController {
  constructor(private readonly prestamoService: PrestamoService) {}

  @Post('/crear')
  async create(@Body() createPrestamoDto: CreatePrestamoDto) {
    return await this.prestamoService.create(createPrestamoDto);
  }

  @Get()
  async findAll() {
    return await this.prestamoService.findAll();
  }
}
