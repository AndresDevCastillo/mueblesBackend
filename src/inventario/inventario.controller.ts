import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { CreateInventarioDto, UpdateInventarioDto } from './dto/inventario.dto';
import { ValidateObjectidPipe } from 'src/common/validate-objectid/validate-objectid.pipe';

@Controller('inventario')
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  @Post('crear')
  async create(@Body() createInventarioDto: CreateInventarioDto) {
    return await this.inventarioService.create(createInventarioDto);
  }

  @Get()
  async findAll() {
    return await this.inventarioService.findAll();
  }

  @Get('obtener/:id')
  async findOne(@Param('id', ValidateObjectidPipe) id: string) {
    return await this.inventarioService.findOne(id);
  }
  @Get('/productos')
  async productosSinInventario(){
    return await this.inventarioService.productosSinInventario();
  }

  @Put('/actualizar')
  update(@Body() updateInventarioDto: UpdateInventarioDto) {
    return this.inventarioService.update(updateInventarioDto);
  }

  @Delete('/:id')
  remove(@Param('id', ValidateObjectidPipe) id: string) {
    return this.inventarioService.remove(id);
  }
}
