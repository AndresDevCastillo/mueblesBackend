import { HttpException, Inject, Injectable } from '@nestjs/common';
import { CreatePrestamoDto } from './dto/prestamo.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Prestamo } from './schema/prestamo.schema';
import { Model } from 'mongoose';
import { ClienteService } from 'src/cliente/cliente.service';

@Injectable()
export class PrestamoService {
  constructor(
    @InjectModel(Prestamo.name) private prestamoModel: Model<Prestamo>,
    @Inject(ClienteService) private clienteService : ClienteService
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

  async delete(id: string) {
    try {
      return await this.prestamoModel.findByIdAndDelete(id);
    } catch(error) {
      this.handleBDerrors(error);
    }
  }

  async clientesSinPrestamos() {
    const CLIENTES = await this.prestamoModel.find({completado: false}).select('cliente');
    const idClientes: any = CLIENTES.map(cliente => {
      return cliente.cliente;
    });
    return await this.clienteService.clientesSinPrestamis(idClientes);
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
