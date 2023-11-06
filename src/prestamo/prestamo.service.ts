import { HttpException, Inject, Injectable } from '@nestjs/common';
import { CreatePrestamoDto } from './dto/prestamo.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Prestamo } from './schema/prestamo.schema';
import { Model } from 'mongoose';
import { ClienteService } from 'src/cliente/cliente.service';
import { Inventario } from 'src/inventario/schema/inventario.schema';

@Injectable()
export class PrestamoService {
  constructor(
    @InjectModel(Prestamo.name) private prestamoModel: Model<Prestamo>,
    @InjectModel(Inventario.name) private inventarioModel: Model<Inventario>,
    @Inject(ClienteService) private clienteService: ClienteService,
  ) {}

  async create(createPrestamoDto: CreatePrestamoDto) {
    try {
      const inventario = await this.inventarioModel.findOne({
        _id: createPrestamoDto.inventario,
      });
      if (inventario.existencias >= createPrestamoDto.cantidad) {
        await this.inventarioModel.findOneAndUpdate(
          { _id: createPrestamoDto.inventario },
          { existencias: inventario.existencias - createPrestamoDto.cantidad },
        );
        const copia = { ...createPrestamoDto };
        delete copia.inventario;
        return await this.prestamoModel.create({
          ...copia,
          completado: copia.cuotas == 0 ? true : false,
        });
      }
      return this.handleBDerrors(
        `No hay suficientes ${createPrestamoDto.producto}, sólo hay ${inventario.existencias}`,
        409,
      );

      //await this.inventarioModel.findOneAndUpdate({_id: createPrestamoDto.producto});
      //return await this.prestamoModel.create(createPrestamoDto);
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
    } catch (error) {
      this.handleBDerrors(error);
    }
  }

  async clientesSinPrestamos() {
    const CLIENTES = await this.prestamoModel
      .find({ completado: false })
      .select('cliente');
    const idClientes: any = CLIENTES.map((cliente) => {
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
