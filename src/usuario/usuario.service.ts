import { HttpException, Injectable } from '@nestjs/common';
import { UsuarioDto } from './dto/usuario.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Usuario } from './schema/usuario.schema';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
  ) {}
  async create(createUsuarioDto: UsuarioDto) {
    try {
      createUsuarioDto.contrasena = bcrypt.hashSync(
        createUsuarioDto.contrasena,
        10,
      );
      return await this.usuarioModel.create(createUsuarioDto);
    } catch (error) {
      this.handleBDerrors(error);
    }
  }

  findAll() {
    return `This action returns all usuario`;
  }

  findOne(id: number) {
    return `This action returns a #${id} usuario`;
  }

  remove(id: number) {
    return `This action removes a #${id} usuario`;
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
