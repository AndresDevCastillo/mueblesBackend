import { HttpException, Injectable } from '@nestjs/common';
import { UpdateUsuarioDto, UsuarioDto } from './dto/usuario.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Usuario } from './schema/usuario.schema';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { AgregarRutaDto } from './dto/agregarRuta.dto';

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

  async findAll() {
    try {
      return await this.usuarioModel
        .find()
        .select(['_id', 'nombre', 'usuario', 'rol', 'rutas']);
    } catch (error) {
      this.handleBDerrors(error);
    }
  }

  async agregarRuta(agregarRutaCobrador: AgregarRutaDto) {
  
    return await this.usuarioModel
      .findByIdAndUpdate(
        { _id: agregarRutaCobrador.cobrador },
        { rutas: agregarRutaCobrador.rutas },
      )
      .then(() => {
        return true;
      })
      .catch((error) => {
        this.handleBDerrors(error);
        return false;
      });
  }
  getRoles() {
    return ['Admin', 'Cobrador'];
  }

  async getRutasCobrador(idCobrador: string) {
    return await this.usuarioModel.find({ _id: idCobrador }).select(['rutas']);
  }

  async getCobradores() {
    return await this.usuarioModel
      .find({ rol: 'Cobrador' })
      .select(['_id', 'nombre', 'rutas'])
  }

  async update(updateUsuarioDto: UpdateUsuarioDto) {
    const paqueteUpdate = { ...updateUsuarioDto };
    delete paqueteUpdate.id;
    paqueteUpdate.usuario.length == 0 ? delete paqueteUpdate.usuario : null;
    paqueteUpdate.contrasena.length == 0
      ? delete paqueteUpdate.contrasena
      : (paqueteUpdate.contrasena = await bcrypt.hashSync(
          paqueteUpdate.contrasena,
          10,
        ));
    try {
      return await this.usuarioModel.findByIdAndUpdate(
        updateUsuarioDto.id,
        paqueteUpdate,
      );
    } catch (error) {
      this.handleBDerrors(error);
    }
  }
  async remove(id: string) {
    try {
      return await this.usuarioModel.findByIdAndDelete(id);
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
