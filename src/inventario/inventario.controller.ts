import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { CreateInventarioDto, UpdateInventarioDto } from './dto/inventario.dto';
import { ValidateObjectidPipe } from 'src/common/validate-objectid/validate-objectid.pipe';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';

@Controller('inventario')
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  @Post('crear')
  @UseGuards(JwtAuthGuard)
  async create(@Body() createInventarioDto: CreateInventarioDto) {
    return await this.inventarioService.create(createInventarioDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return await this.inventarioService.findAll();
  }

  @Get('obtener/:id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id', ValidateObjectidPipe) id: string) {
    return await this.inventarioService.findOne(id);
  }
  @Get('/productos')
  @UseGuards(JwtAuthGuard)
  async productosSinInventario(){
    return await this.inventarioService.productosSinInventario();
  }

  @Put('/actualizar')
  @UseGuards(JwtAuthGuard)
  update(@Body() updateInventarioDto: UpdateInventarioDto) {
    return this.inventarioService.update(updateInventarioDto);
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ValidateObjectidPipe) id: string) {
    return this.inventarioService.remove(id);
  }
}
