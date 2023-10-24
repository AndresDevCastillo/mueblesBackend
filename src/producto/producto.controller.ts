import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { ProductoService } from './producto.service';
import { CreateProductoDto } from './dto/producto.dto';
import { UpdateProductoDto } from './dto/producto.dto';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';

@Controller('producto')
export class ProductoController {
  constructor(private readonly productoService: ProductoService) {}

  @Post('/crear')
  @UseGuards(JwtAuthGuard)
  async create(@Body() createProductoDto: CreateProductoDto) {
    return await this.productoService.create(createProductoDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return await this.productoService.findAll();
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productoService.findOne(id);
  }

  @Put('/actualizar')
  @UseGuards(JwtAuthGuard)
  async update(@Body() updateProductoDto: UpdateProductoDto) {
    return await this.productoService.update(updateProductoDto);
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productoService.remove(id);
  }
}
