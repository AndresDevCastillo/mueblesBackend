import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { PrestamoService } from './prestamo.service';
import { CreatePrestamoDto } from './dto/prestamo.dto';
import { ValidateObjectidPipe } from 'src/common/validate-objectid/validate-objectid.pipe';

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

  @Get('/clientes')
  async getClientesSinPrestamo() {
    return await this.prestamoService.clientesSinPrestamos();
  }

  @Delete('/:id')
  async delete(@Param('id', ValidateObjectidPipe) id: string) {
    return await this.prestamoService.delete(id);
  }

  
}
