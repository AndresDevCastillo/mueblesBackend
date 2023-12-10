import { HttpException, Injectable } from '@nestjs/common';
import { CreateBodegaDto } from './dto/bodega.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Bodega } from './schema/bodega.schema';
import { Model } from 'mongoose';

@Injectable()
export class BodegaService {
  constructor(@InjectModel(Bodega.name) private bodegaModel: Model<Bodega>) {}
  async create(createBodegaDto: CreateBodegaDto) {
    try {
      return await this.bodegaModel.create(createBodegaDto);
    } catch (error) {
      this.handleBDerrors(error);
    }
  }

  async findAll() {
    try {
      return await this.bodegaModel.find();
    } catch (error) {
      this.handleBDerrors(error);
    }
  }

  async findOne(id: string) {
    try {
      return await this.bodegaModel.findById(id);
    } catch (error) {
      this.handleBDerrors(error);
    }
  }

  async remove(id: string) {
    try {
      return await this.bodegaModel.findByIdAndDelete(id);
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
