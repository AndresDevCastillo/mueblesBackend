import { HttpException, Injectable } from '@nestjs/common';
import { CreateClienteDto, UpdateClienteDto } from './dto/cliente.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Cliente } from './schema/cliente.schema';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Inventario } from 'src/inventario/schema/inventario.schema';
import { Prestamo } from 'src/prestamo/schema/prestamo.schema';

@Injectable()
export class ClienteService {
  constructor(
    @InjectModel(Cliente.name) private clienteModel: Model<Cliente>,
    @InjectModel(Inventario.name) private inventarioModel: Model<Inventario>,
    @InjectModel(Prestamo.name) private prestamoModel: Model<Prestamo>,
  ) {}
  async create(createClienteDto: CreateClienteDto) {
    try {
      const exist = await this.existCliente(createClienteDto.documento);
      if (!exist) {
        const inventario = await this.inventarioModel.find({
          _id: createClienteDto.venta.inventario,
        });
        if (inventario.length > 0) {
          if (inventario[0].existencias >= createClienteDto.venta.cantidad) {
            const cliente = await this.clienteModel.create({
              documento: createClienteDto.documento,
              nombres: createClienteDto.nombres,
              apellidos: createClienteDto.apellidos,
              telefono: createClienteDto.telefono,
              correo: createClienteDto.correo,
              direccion: createClienteDto.direccion._id,
            });
            await this.prestamoModel.create({
              cliente: cliente._id,
              ruta: createClienteDto.direccion.nombre,
              producto: createClienteDto.venta.producto,
              cantidad: createClienteDto.venta.cantidad,
              fecha_inicio: new Date().toISOString(),
              cuotas: createClienteDto.venta.cuotas,
              pago_fechas: createClienteDto.venta.pago_fechas,
              total: createClienteDto.venta.total,
              completado: createClienteDto.venta.cuotas == 0 ? true : false,
            });
            await this.inventarioModel.updateOne(
              { _id: createClienteDto.venta.inventario },
              {
                existencias:
                  inventario[0].existencias - createClienteDto.venta.cantidad,
              },
            );
            return { status: 201, message: 'Cliente creado correctament' };
          }
          return this.handleBDerrors(
            `No hay suficientes ${createClienteDto.venta.producto}, sólo hay ${inventario[0].existencias}`,
            409,
          );
        }
        return this.handleBDerrors('No se encontró el inventario', 409);
      }
      return this.handleBDerrors(
        'Ya existe un cliente con este documento',
        409,
      );
    } catch (error) {
      return this.handleBDerrors(error);
    }
  }

  async findAll() {
    try {
      return await this.clienteModel.find().populate('direccion');
    } catch (error) {}
  }

  async findOne(id: string) {
    try {
      return (await this.clienteModel.findById(id)).populate('direccion');
    } catch (error) {
      this.handleBDerrors(error);
    }
  }

  async update(updateClienteDto: UpdateClienteDto) {
    try {
      return await this.clienteModel.findByIdAndUpdate(
        updateClienteDto.id,
        updateClienteDto,
      );
    } catch (error) {
      this.handleBDerrors(error);
    }
  }

  async remove(id: string) {
    try {
      return await this.clienteModel.findByIdAndDelete(id);
    } catch (error) {
      this.handleBDerrors(error);
    }
  }
  async clientesSinPrestamis(idClientes: ObjectId[]) {
    try {
      return await this.clienteModel
        .find({
          _id: { $nin: idClientes },
        })
        .populate('direccion');
    } catch (error) {
      this.handleBDerrors(error);
    }
  }

  async existCliente(documento: number): Promise<boolean> {
    return await this.clienteModel
      .find({ documento: documento })
      .then((cliente) => {
        return cliente.length > 0;
      });
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
