import { HttpException, Inject, Injectable } from '@nestjs/common';
import { CreatePuebloDto, UpdatePuebloDto } from './dto/pueblo.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Pueblo } from './schema/pueblo.schema';
import mongoose, { Model } from 'mongoose';
import { UsuarioService } from 'src/usuario/usuario.service';
import { Cliente } from 'src/cliente/schema/cliente.schema';
import { ObjectId } from 'mongodb';

@Injectable()
export class PuebloService {
  constructor(
    @InjectModel(Pueblo.name) private puebloModel: Model<Pueblo>,
    @InjectModel(Cliente.name) private clienteModel: Model<Cliente>,
    @Inject(UsuarioService) private usuarioService: UsuarioService,
  ) {}
  async create(pueblo: CreatePuebloDto) {
    try {
      return await this.puebloModel.create(pueblo);
    } catch (error) {
      this.handleBDerrors(error);
    }
  }
  async findAll() {
    try {
      return await this.puebloModel.find();
    } catch (error) {
      this.handleBDerrors(error);
    }
  }
  async findOne(id: string) {
    try {
      return await this.puebloModel.findById(id);
    } catch (error) {
      this.handleBDerrors(error);
    }
  }

  async getRutasSinCobrador(idCobrador: string) {
    const rutasCobrador =
      await this.usuarioService.getRutasCobrador(idCobrador);

    return await this.puebloModel.find({
      _id: { $not: { $in: rutasCobrador[0].rutas } },
    });
  }

  async remove(id: string) {
    try {
      const cRuta = await this.clienteModel.find({
        direccion: new mongoose.Types.ObjectId(id),
      });
      return cRuta.length > 0
        ? {
            delete: false,
            message: 'No puedes eliminar esta ruta, tiene clientes asociados',
          }
        : await this.puebloModel
            .findByIdAndDelete(id)
            .then(() => {
              return {
                delete: true,
                message: 'Ruta eliminada',
              };
            })
            .catch((error) => {
              return {
                delete: false,
                message: error,
              };
            });
    } catch (error) {
      this.handleBDerrors(error);
    }
  }
  async update(puebloUpdate: UpdatePuebloDto) {
    try {
      return await this.puebloModel.findByIdAndUpdate(
        puebloUpdate.id,
        puebloUpdate,
      );
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
