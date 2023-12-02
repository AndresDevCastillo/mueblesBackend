import {
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePrestamoDto, cobroDto } from './dto/prestamo.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Prestamo } from './schema/prestamo.schema';
import { Model } from 'mongoose';
import { ClienteService } from 'src/cliente/cliente.service';
import { Inventario } from 'src/inventario/schema/inventario.schema';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CronMongo } from 'src/cron/schema/cron.schema';
import { AbonosDto } from './dto/abonos.dto';
const { DateTime } = require('luxon');

@Injectable()
export class PrestamoService {
  constructor(
    @InjectModel(Prestamo.name) private prestamoModel: Model<Prestamo>,
    @InjectModel(Inventario.name) private inventarioModel: Model<Inventario>,
    @InjectModel(CronMongo.name) private cronModel: Model<CronMongo>,
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
        const copia = {
          ...createPrestamoDto,
          cuota_sugerida:
            createPrestamoDto.cuotas == 0
              ? 0
              : Math.ceil(createPrestamoDto.total / createPrestamoDto.cuotas),
        };
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
  async abonar(abonos: AbonosDto) {
    const cliente = await this.clienteService.crearClienteAntiguo({
      documento: abonos.documento,
      nombres: abonos.nombres,
      apellidos: abonos.apellidos,
      telefono: abonos.telefono,
      correo: abonos.correo,
      direccion: abonos.ruta,
      direccionResidencia: abonos.direccionResidencia,
    });
    if (cliente) {
      return await this.prestamoModel.create({
        cliente: cliente._id,
        ruta: abonos.rutaPlana,
        producto: abonos.producto,
        cantidad: 1,
        fecha_inicio: abonos.fechaVenta,
        cuotas: abonos.pago_fechas.length,
        pago_fechas: abonos.pago_fechas,
        abono: abonos.abonos,
        total: abonos.total,
        completado: abonos.pago_fechas.length == 0,
      });
    }
    return this.handleBDerrors('Ya existe un cliente con ese documento', 409);
  }
  async cobrar(cobro: cobroDto) {
    const prestamo = await this.prestamoModel.findById(cobro.id);
    if (prestamo) {
      prestamo.abono.push({
        fecha: new Date(),
        monto: cobro.abono,
      });
      let abonado: number = 0;
      prestamo.abono.forEach((abono) => {
        abonado += abono.monto;
      });
      if (abonado >= prestamo.total) {
        prestamo.completado = true;
        prestamo.mora = false;
        prestamo.cuotas_atrasadas = 0;
        prestamo.cuota_sugerida = 0;
        return prestamo.save();
      }
      const hoy: Date = new Date();
      let abonominimo: number = 0;
      prestamo.pago_fechas.forEach((pagoFecha) => {
        if (hoy > new Date(pagoFecha.fecha)) {
          abonominimo++;
        }
      });
      if (prestamo.abono.length < abonominimo) {
        prestamo.mora = true;
        prestamo.cuotas_atrasadas = prestamo.abono.length - abonominimo;
      } else {
        prestamo.mora = false;
        prestamo.cuotas_atrasadas = 0;
      }
      if (prestamo.cuotas <= prestamo.abono.length) {
        prestamo.cuota_sugerida = prestamo.total - abonado;
      } else {
        const cuotasRestantes = prestamo.cuotas - prestamo.abono.length;
        prestamo.cuota_sugerida = Math.ceil(
          (prestamo.total - abonado) / cuotasRestantes,
        );
      }
      return await prestamo.save();
    }
    return new NotFoundException('EL prestamo no existe');
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async actualizarCobros() {
    try {
      const prestamosVigentes = await this.prestamoModel.find({
        completado: false,
      });
      const prestamosActualizados = prestamosVigentes.map(async (prestamo) => {
        let abonado: number = 0;
        prestamo.abono.forEach((abono) => {
          abonado += abono.monto;
        });
        if (abonado >= prestamo.total) {
          prestamo.completado = true;
          prestamo.mora = false;
          prestamo.cuotas_atrasadas = 0;
          prestamo.cuota_sugerida = 0;
          return prestamo.save();
        }
        const hoy: Date = new Date();
        let abonominimo: number = 0;
        prestamo.pago_fechas.forEach((pagoFecha) => {
          if (hoy > new Date(pagoFecha.fecha)) {
            abonominimo++;
          }
        });
        if (prestamo.abono.length < abonominimo) {
          prestamo.mora = true;
          prestamo.cuotas_atrasadas = prestamo.abono.length - abonominimo;
        } else {
          prestamo.mora = false;
          prestamo.cuotas_atrasadas = 0;
        }
        if (prestamo.cuotas <= prestamo.abono.length) {
          prestamo.cuota_sugerida = prestamo.total - abonado;
        } else {
          const cuotasRestantes = prestamo.cuotas - prestamo.abono.length;
          prestamo.cuota_sugerida = Math.ceil(
            (prestamo.total - abonado) / cuotasRestantes,
          );
        }
        return await prestamo.save();
      });
      const prestamosActualizadosResolved = await Promise.all(
        prestamosActualizados,
      );
      await this.cronModel.create({
        nombre: 'Actualizo las ventas activas',
        fecha: new Date().toLocaleString('es-ES'),
      });
      return `Se actualizaron ${prestamosActualizadosResolved.length} ventas`;
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
  async findCobrar() {
    try {
      const hoy = new Date();
      const hoyFormateada = new Date(
        Date.UTC(
          hoy.getFullYear(),
          hoy.getMonth(),
          hoy.getDate(),
          0, // Hora en UTC
          0, // Minutos en UTC
          0, // Segundos en UTC
          0, // Milisegundos en UTC
        ),
      ).toISOString();
      const cobros = await this.prestamoModel
        .find({
          completado: false,
        })
        .populate('cliente');
      const cobrosHoy = cobros.filter((cobro) => {
        return cobro.pago_fechas.some((fechas_pago) => {
          return new Date(fechas_pago.fecha).toISOString() === hoyFormateada;
        });
      });
      return cobrosHoy;
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
  async estadisticas() {
    const ventaDataSet = new Array(12).fill(0);
    const abonoDataSet = new Array(12).fill(0);
    const year = new Date().getFullYear();
    const semana = [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ];
    const yearC = {
      fecha: year,
      total: 0,
      ventas: 0,
      abono: 0,
    };
    const mes = {
      fecha: new Date().getMonth(),
      total: 0,
      ventas: 0,
      abono: 0,
    };
    const hoy = {
      fecha: semana[DateTime.now().setZone('America/Bogota').weekday],
      total: 0,
      ventas: 0,
      abono: 0,
    };
    const prestamos = await this.prestamoModel.find({
      fecha_inicio: { $regex: '.*' + year + '.*' },
    });
    const prestamosViejos = await this.prestamoModel.find({
      fecha_inicio: { $not: { $regex: '.*' + year + '.*' } },
    });
    console.log(prestamosViejos);
    // Recorro prestamos
    prestamos.forEach((prestamo) => {
      yearC.ventas += 1;
      yearC.total += prestamo.total;
      const mesArray = prestamo.fecha_inicio.split('-');

      // valido las fechas de la venta
      if (parseInt(mesArray[1]) == new Date().getMonth() + 1) {
        mes.ventas += 1;
        mes.total += prestamo.total;
        if (
          this.sonFechasIguales(new Date(), new Date(prestamo.fecha_inicio))
        ) {
          hoy.ventas += 1;
          hoy.total += prestamo.total;
        }
      }
      ventaDataSet[parseInt(mesArray[1]) - 1] += prestamo.total;
      // Valido las fechas de los abonos
      prestamo.abono.forEach((abono) => {
        if (new Date().getMonth() == new Date(abono.fecha).getMonth()) {
          mes.abono += abono.monto;
          if (this.sonFechasIguales(new Date(), new Date(abono.fecha))) {
            hoy.abono += abono.monto;
          }
        }

        yearC.abono += abono.monto;
        const mesAbono = new Date(abono.fecha).toISOString().split('-');
        abonoDataSet[parseInt(mesAbono[1]) - 1] += abono.monto;
      });
    });
    prestamosViejos.forEach((prestamo) => {
      // Valido las fechas de los abonos
      prestamo.abono.forEach((abono) => {
        if (new Date().getFullYear() == new Date(abono.fecha).getFullYear()) {
          yearC.abono += abono.monto;
          const mesAbono = new Date(abono.fecha).toISOString().split('-');
          abonoDataSet[parseInt(mesAbono[1]) - 1] += abono.monto;
          if (new Date().getMonth() == new Date(abono.fecha).getMonth()) {
            mes.abono += abono.monto;
            if (this.sonFechasIguales(new Date(), new Date(abono.fecha))) {
              hoy.abono += abono.monto;
            }
          }
        }
      });
    });

    return {
      ventas: ventaDataSet,
      abonos: abonoDataSet,
      year: yearC,
      mes: mes,
      hoy: hoy,
    };
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
  private sonFechasIguales(fecha1: Date, fecha2: Date) {
    return (
      fecha1.getFullYear() === fecha2.getFullYear() &&
      fecha1.getMonth() === fecha2.getMonth() &&
      fecha1.getDate() === fecha2.getDate()
    );
  }
}
