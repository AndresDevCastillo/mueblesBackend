import { HttpException, Injectable } from '@nestjs/common';
import { CreateClienteDto, UpdateClienteDto } from './dto/cliente.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Cliente } from './schema/cliente.schema';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';

@Injectable()
export class ClienteService {
  constructor(@InjectModel(Cliente.name) private clienteModel: Model<Cliente>){}
  async create(createClienteDto: CreateClienteDto) {
    try {
      return await this.clienteModel.create(createClienteDto);
    } catch(error)
    {
      this.handleBDerrors(error);
    }
  }

  async findAll() {
    try {
      return await this.clienteModel.find().populate('direccion');
    } catch(error){

    }
  }

  async findOne(id: string) {
    try {
      return (await this.clienteModel.findById(id)).populate('direccion');
    } catch(error) {
      this.handleBDerrors(error);
    }
  }

  async update(updateClienteDto: UpdateClienteDto) {
    try {
      return await this.clienteModel.findByIdAndUpdate(updateClienteDto.id, updateClienteDto);
    } catch(error) {
      this.handleBDerrors(error);
    }
  }

  async remove(id: string) {
    try {
      return await this.clienteModel.findByIdAndDelete(id);
    } catch(error) {
      this.handleBDerrors(error);
    }
  }
    async clientesSinPrestamis(idClientes: ObjectId[]){
    try {
      return await this.clienteModel.find({
        _id: {$nin: idClientes}
      }).populate('direccion');
    } catch(error) {
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
