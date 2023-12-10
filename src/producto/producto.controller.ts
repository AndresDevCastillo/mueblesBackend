import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { ProductoService } from './producto.service';
import { CreateProductoDto } from './dto/producto.dto';
import { UpdateProductoDto } from './dto/producto.dto';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { ValidateObjectidPipe } from 'src/common/validate-objectid/validate-objectid.pipe';

@Controller('producto')
@UseGuards(JwtAuthGuard)
export class ProductoController {
  constructor(private readonly productoService: ProductoService) {}

  @Post('/crear')
  async create(@Body() createProductoDto: CreateProductoDto) {
    return await this.productoService.create(createProductoDto);
  }

  @Get()
  async findAll() {
    return await this.productoService.findAll();
  }

  @Get('/:id')
  findOne(@Param('id', ValidateObjectidPipe) id: string) {
    return this.productoService.findOne(id);
  }

  @Put('/actualizar')
  async update(@Body() updateProductoDto: UpdateProductoDto) {
    return await this.productoService.update(updateProductoDto);
  }

  @Delete('/:id')
  remove(@Param('id', ValidateObjectidPipe) id: string) {
    return this.productoService.remove(id);
  }
}
