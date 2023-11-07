import { Controller, Get, Post, Body, Delete, Param, UseGuards } from '@nestjs/common';
import { PrestamoService } from './prestamo.service';
import { CreatePrestamoDto, cobroDto } from './dto/prestamo.dto';
import { ValidateObjectidPipe } from 'src/common/validate-objectid/validate-objectid.pipe';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';

@Controller('prestamo')
export class PrestamoController {
  constructor(private readonly prestamoService: PrestamoService) {}

  @Post('/crear')
  @UseGuards(JwtAuthGuard)
  async create(@Body() createPrestamoDto: CreatePrestamoDto) {
    return await this.prestamoService.create(createPrestamoDto);
  }

  @Post('/cobrar')
  @UseGuards(JwtAuthGuard)
  async cobrar(@Body() cobro: cobroDto) {
    return await this.prestamoService.cobrar(cobro);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return await this.prestamoService.findAll();
  }
  @Get('/cobrar')
  @UseGuards(JwtAuthGuard)
  async findCobrar() {
    return await this.prestamoService.findCobrar();
  }

  @Get('/clientes')
  @UseGuards(JwtAuthGuard)
  async getClientesSinPrestamo() {
    return await this.prestamoService.clientesSinPrestamos();
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id', ValidateObjectidPipe) id: string) {
    return await this.prestamoService.delete(id);
  }
}
