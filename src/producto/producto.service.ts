import { HttpException, Injectable } from '@nestjs/common';
import { CreateProductoDto } from './dto/producto.dto';
import { UpdateProductoDto } from './dto/producto.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Producto } from './schema/producto.schema';
import { Model } from 'mongoose';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ProductoService {
  constructor(
    @InjectModel(Producto.name) private productoModel: Model<Producto>,
  ) {}
  async create(createProductoDto: CreateProductoDto) {
    try {
      return await this.productoModel.create(createProductoDto);
    } catch (error) {
      this.handleBDerrors(error);
    }
  }

  async findAll() {
    try {
      return await this.productoModel.find();
    } catch (error) {
      this.handleBDerrors(error);
    }
  }

  async findOne(id: string) {
    try {
      return await this.productoModel.findById(id);
    } catch (error) {
      this.handleBDerrors(error);
    }
  }

  async update(updateProductoDto: UpdateProductoDto) {
    try {
      return await this.productoModel.findByIdAndUpdate(
        updateProductoDto.id,
        updateProductoDto,
      );
    } catch (error) {
      this.handleBDerrors(error);
    }
  }

  async remove(id: string) {
    try {
      return await this.productoModel.findByIdAndDelete(id);
    } catch (error) {
      this.handleBDerrors(error);
    }
  }
  async productosSinInventario(idInventario: string[]) {
    try {
      return await this.productoModel.find({
        _id: { $nin: idInventario },
      });
    } catch (error) {
      this.handleBDerrors(error);
    }
  }

  private handleBDerrors(error: any, codeError = 500) {
    console.log(error);
    throw new HttpException(
      { message: error, suggest: 'Por favor revise los logs del sistema' },
      codeError,
      {
        cause: error,
      },
    );
  }
}
