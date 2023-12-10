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
import { ClienteAntiguoDto } from './dto/clienteAntiguo.dto';
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
              direccionResidencia: createClienteDto.direccionResidencia,
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
              cuota_sugerida:
                createClienteDto.venta.cuotas == 0
                  ? 0
                  : Math.ceil(
                      createClienteDto.venta.total /
                        createClienteDto.venta.cuotas,
                    ),
              completado: createClienteDto.venta.cuotas == 0 ? true : false,
            });
            await this.inventarioModel.updateOne(
              { _id: createClienteDto.venta.inventario },
              {
                existencias:
                  inventario[0].existencias - createClienteDto.venta.cantidad,
              },
            );
            return { status: 201, message: 'Cliente creado correctamente' };
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
  async crearClienteAntiguo(clienteAntiguo: ClienteAntiguoDto) {
    const now = moment().tz('America/Bogota').format();
    try {
      const exist = await this.existCliente(clienteAntiguo.documento);
      if (!exist) {
        return await this.clienteModel.create({
          ...clienteAntiguo,
          creacion: now,
        });
      }
      return await this.clienteModel.findOne({
        documento: clienteAntiguo.documento,
      });
    } catch (error) {
      return false;
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
      const ruta = await this.puebloModel.findById(updateClienteDto.direccion);
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

  async getPuebloSinRuta() {
    const exist = await this.puebloModel.find({ nombre: 'Sin ruta' });
    if (exist.length == 0) {
      return await this.puebloModel.create({
        nombre: 'Sin ruta',
        ciudad: 'Montería',
        departamento: 'Córdoba',
      });
    }
    return exist[0];
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
  async subirClientes(excel: Express.Multer.File, cobrador: string) {
    const excelJson = await excelToJson({ sourceFile: excel.path });
    const puebloSinRuta = await this.getPuebloSinRuta();
    await this.prestamoModel.deleteMany({ ruta: { $in: ['Sin ruta'] } });
    await this.deleteClientByRuta(puebloSinRuta._id);
    const documentos = await this.getDocumentos();
    const keyObj = Object.keys(excelJson);
    const clientes: object[] = [];
    const clientesExist: object[] = [];
    const clientesGuardar: object[] = [];
    let prestamosGuardar: object[] = [];
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
            direccion: puebloSinRuta._id,
            direccionResidencia: cliente['E'],
            mora: false,
            creacion: moment(cliente['A']).tz('America/Bogota').format(),
          });
          const fechaInicio = moment(cliente['A'])
            .tz('America/Bogota')
            .format();

          const fUltPago = cliente['P'] ? cliente['P'] : cliente['A'];
          const fechaPago = moment(fUltPago).tz('America/Bogota').format();
          const total = parseFloat(cliente['G'].replaceAll('.', ''));
          const debe = parseFloat(cliente['M'].replaceAll('.', ''));
          const monto = total - debe == 0 ? total : total - debe;

          const pagoFechas = [
            {
              fecha: fechaPago,
              monto: monto,
            },
          ];
          const abonoFecha = [
            {
              fecha: fechaPago,
              monto: monto,
              cobrador: cobrador
            },
          ];

          prestamosGuardar.push({
            ruta: puebloSinRuta.nombre,
            producto: '',
            cantidad: 1,
            fecha_inicio: fechaInicio,
            cuotas: 1,
            pago_fechas: pagoFechas,
            abono: abonoFecha,
            cuotas_atrasadas: 0,
            completado: debe == 0,
            mora: false,
            total: total,
          });
        }
      }
    });
    if (clientesGuardar.length == 0) {
      return { status: false, message: 'Sin clientes para crear' };
    }
    const clientesG = await this.clienteModel.insertMany(clientesGuardar);
    prestamosGuardar = prestamosGuardar.map((prestamo: any, index) => {
      prestamo.cliente = clientesG[index]._id;
      return prestamo;
    });
    await this.prestamoModel.insertMany(prestamosGuardar);
    fs.unlinkSync(excel.path);
    //this.prestamoService.actualizarCobros();
    return {
      status: true,
      message: `Se agregaron ${clientesG.length} clientes, clientes omitidos ${clientesExist.length}`,
    };
  }
  async actualizarRutaCliente(idCliente: string, idRuta: string){
    try {
      await this.clienteModel.findByIdAndUpdate(idCliente, {
        $set: {
          direccion: idRuta
        }
      })
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
