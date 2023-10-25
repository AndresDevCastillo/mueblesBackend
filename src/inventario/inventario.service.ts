import { HttpException, Injectable } from '@nestjs/common';
import { CreateInventarioDto, UpdateInventarioDto } from './dto/inventario.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Inventario } from './schema/inventario.schema';

@Injectable()
export class InventarioService {
  constructor(@InjectModel(Inventario.name) private inventarioModel: Model<Inventario>){}
  async create(createInventarioDto: CreateInventarioDto) {
    try {
      return await this.inventarioModel.create({
        ...createInventarioDto,
        existencias: createInventarioDto.cantidad
      });
    } catch(error) {
      this.handleBDerrors(error);
    }
  }

  async findAll() {
    try {
    return await this.inventarioModel.find().populate('producto');
    } catch(error) {
      this.handleBDerrors(error);
    }
  }

  async findOne(id: string) {
    try {
      return await this.inventarioModel.findById(id).populate('producto');
    } catch(error) {
      this.handleBDerrors(error);
    }
  }

  async update(updateInventarioDto: UpdateInventarioDto) {
    try {
      return await this.inventarioModel.findByIdAndUpdate(updateInventarioDto.id, {
        ...updateInventarioDto
      })
    } catch(error) {
      this.handleBDerrors(error);
    }
  }

  async remove(id: string) {
    try {
      return await this.inventarioModel.findByIdAndDelete(id);
    } catch(error){
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
