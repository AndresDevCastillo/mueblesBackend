import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CronMongo } from './schema/cron.schema';
import { Model } from 'mongoose';

@Injectable()
export class CronService {
  constructor(
    @InjectModel(CronMongo.name) private cronModel: Model<CronMongo>,
  ) {}

  private crearDocumento(nombre: string) {
    try {
      this.cronModel.create({
        nombre: nombre,
        fecha: new Date().toLocaleString('es-ES'),
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
