import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
  Put,
  Request,
} from '@nestjs/common';
import { PrestamoService } from './prestamo.service';
import { CreatePrestamoDto, cobroDto } from './dto/prestamo.dto';
import { ValidateObjectidPipe } from 'src/common/validate-objectid/validate-objectid.pipe';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { AbonosDto } from './dto/abonos.dto';
import { ActualizarVentaDto } from './dto/actualizarVenta.dto';
import { AbonoVentaDto, dateAbonoFind } from './dto/abono.dto';

@Controller('prestamo')
@UseGuards(JwtAuthGuard)
export class PrestamoController {
  constructor(private readonly prestamoService: PrestamoService) {}

  @Post('/crear')
  async create(@Body() createPrestamoDto: CreatePrestamoDto) {
    return await this.prestamoService.create(createPrestamoDto);
  }

  @Post('/cobrar')
  async cobrar(@Body() cobro: cobroDto, @Request() { user }) {
    return await this.prestamoService.cobrar(cobro, user[0].nombre);
  }

  @Post('/abonar')
  async abonar(@Body() abonos: AbonosDto, @Request() { user }) {
    return await this.prestamoService.abonar(abonos, user[0].nombre);
  }

  @Get()
  async findAll() {
    return await this.prestamoService.findAll();
  }
  @Get('/cobrar')
  async findCobrar() {
    return await this.prestamoService.findCobrar();
  }

  @Post('/cobroEspecifico')
  async findCobroEspecifico(@Body() date : dateAbonoFind) {
    console.log(date);
    return await this.prestamoService.findCobroEspecifico(date);
  }

  @Get('/clientes')
  async getClientesSinPrestamo() {
    return await this.prestamoService.clientesSinPrestamos();
  }
  @Get('estadisticas/obtener')
  async estadisticas() {
    return await this.prestamoService.estadisticas();
  }

  @Put('/actualizarTodo')
  async actualizarClientes() {
    return this.prestamoService.actualizarCobros();
  }

  @Put('/actualizarVenta')
  async actualizarVenta(@Body() actualizarVenta: ActualizarVentaDto) {
    return await this.prestamoService.actualizarVenta(actualizarVenta);
  }

  @Put('/abonar/venta')
  async abonarVenta(@Body() abono: AbonoVentaDto, @Request() { user }) {
    return await this.prestamoService.abonarVenta(abono, user[0].nombre);
  }
  @Delete('/:id')
  async delete(@Param('id', ValidateObjectidPipe) id: string) {
    return await this.prestamoService.delete(id);
  }
}
