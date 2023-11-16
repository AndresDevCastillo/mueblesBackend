import { HttpException, Injectable } from '@nestjs/common';
import { CreateClienteDto, UpdateClienteDto } from './dto/cliente.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Cliente } from './schema/cliente.schema';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Inventario } from 'src/inventario/schema/inventario.schema';
import { Prestamo } from 'src/prestamo/schema/prestamo.schema';
import { Pueblo } from 'src/pueblo/schema/pueblo.schema';
import * as moment from 'moment-timezone';
import * as excelToJson from 'convert-excel-to-json';
import * as fs from 'fs';
@Injectable()
export class ClienteService {
  constructor(
    @InjectModel(Cliente.name) private clienteModel: Model<Cliente>,
    @InjectModel(Inventario.name) private inventarioModel: Model<Inventario>,
    @InjectModel(Prestamo.name) private prestamoModel: Model<Prestamo>,
    @InjectModel(Pueblo.name) private puebloModel: Model<Pueblo>,
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
            const now = moment().tz('America/Bogota').format();
            const cliente = await this.clienteModel.create({
              documento: createClienteDto.documento,
              nombres: createClienteDto.nombres,
              apellidos: createClienteDto.apellidos,
              telefono: createClienteDto.telefono,
              correo: createClienteDto.correo,
              direccion: createClienteDto.direccion._id,
              creacion: now,
            });
            await this.prestamoModel.create({
              cliente: cliente._id,
              ruta: createClienteDto.direccion.nombre,
              producto: createClienteDto.venta.producto,
              cantidad: createClienteDto.venta.cantidad,
              fecha_inicio: now,
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

  async getDocumentos(): Promise<Cliente[]> {
    return await this.clienteModel.find().select(['documento']);
  }

  async getPueblos(): Promise<Pueblo[]> {
    return await this.puebloModel.find();
  }

  async getIdPuebloSinRuta() {
    const exist = await this.puebloModel.find({ nombre: 'Sin ruta' });
    if (exist.length == 0) {
      return await this.puebloModel
        .create({
          nombre: 'Sin ruta',
          ciudad: 'Montería',
          departamento: 'Córdoba',
        })
        .then((pueblo) => {
          return pueblo._id;
        });
    }
    return exist[0]._id;
  }

  async estadisticas() {
    try {
      const dataSet = new Array(12).fill(0);
      const year = new Date().getFullYear();
      const clientes = await this.clienteModel.find({
        creacion: { $regex: '.*' + year + '.*' },
      });
      clientes.forEach((cliente) => {
        const mes = cliente.creacion.split('-');
        dataSet[parseInt(mes[1]) - 1] += 1;
      });
      return dataSet;
    } catch (error) {
      this.handleBDerrors(error);
    }
  }
  async deleteClientByRuta(ruta: ObjectId) {
    const idClientes = await this.clienteModel
      .find({ direccion: ruta })
      .then((cliente) => {
        return cliente.map((cliente) => cliente._id);
      });
    await this.clienteModel.deleteMany({ _id: { $in: idClientes } });
  }
  async subirClientes(excel: Express.Multer.File) {
    const excelJson = await excelToJson({ sourceFile: excel.path });
    const documentos = await this.getDocumentos();
    const idPueblo = await this.getIdPuebloSinRuta();
    const keyObj = Object.keys(excelJson);
    const clientes: object[] = [];
    const clientesExist: object[] = [];
    const clientesGuardar: object[] = [];
    keyObj.forEach(async (sheet, index) => {
      if (index == 0) {
        excelJson[sheet].splice(0, 2);
      }
      for (const cliente of excelJson[sheet]) {
        const exist =
          documentos.length > 0
            ? documentos.findIndex(
                (documento) => documento.documento == cliente['B'],
              )
            : -1;
        exist == -1 ? clientes.push(cliente) : clientesExist.push(cliente);
      }
      for (const cliente of clientes) {
        const nombres = cliente['C']
          .split(' ')
          .filter((item: string) => item.trim() !== '');
        let nombresG = '',
          apellidosG = '';
        switch (nombres.length) {
          case 7:
            nombresG = `${nombres[0]} ${nombres[1]} ${nombres[2]} ${nombres[3]} ${nombres[4]}`;
            apellidosG = `${nombres[5]} ${nombres[6]}`;
            break;
          case 6:
            nombresG = `${nombres[0]} ${nombres[1]} ${nombres[2]} ${nombres[3]}`;
            apellidosG = `${nombres[4]} ${nombres[5]}`;
            break;
          case 5:
            nombresG = `${nombres[0]} ${nombres[1]} ${nombres[2]}`;
            apellidosG = `${nombres[3]} ${nombres[4]}`;
            break;
          case 4:
            nombresG = `${nombres[0]} ${nombres[1]}`;
            apellidosG = `${nombres[2]} ${nombres[3]}`;
            break;
          case 3:
            nombresG = `${nombres[0]}`;
            apellidosG = `${nombres[1]} ${nombres[2]}`;
            break;
          case 2:
            nombresG = `${nombres[0]}`;
            apellidosG = `${nombres[1]}`;
            break;
          case 1:
            nombresG = `${nombres[0]}`;
            break;
        }
        //Que la cédula del excel no este en las cédulas a guardar en la base de datos
        const existG = clientesGuardar.findIndex(
          (cl: any) => parseInt(cliente['B']) == cl.documento,
        );

        if (existG == -1) {
          clientesGuardar.push({
            documento: parseInt(cliente['B']),
            nombres: nombresG,
            apellidos: apellidosG,
            telefono: cliente['D'],
            correo: 'No aplica',
            direccion: idPueblo,
            mora: false,
            creacion: new Date().toISOString().toString(),
          });
        }
      }
    });
    if (clientesGuardar.length == 0) {
      fs.unlinkSync(excel.path);
      return { message: 'Sin clientes para crear' };
    }
    return await this.clienteModel.create(clientesGuardar);
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
