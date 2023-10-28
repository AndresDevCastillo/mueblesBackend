import { HttpException, Injectable } from '@nestjs/common';
import { CreatePrestamoDto } from './dto/prestamo.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Prestamo } from './schema/prestamo.schema';
import { Model } from 'mongoose';

@Injectable()
export class PrestamoService {
  constructor(
    @InjectModel(Prestamo.name) private prestamoModel: Model<Prestamo>,
  ) {}
  async create(createPrestamoDto: CreatePrestamoDto) {
    try {
      return await this.prestamoModel.create(createPrestamoDto);
    } catch (error) {
      this.handleBDerrors(error);
    }
  }

  async findAll() {
    try {
      return await this.prestamoModel.find().populate('cliente');
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
