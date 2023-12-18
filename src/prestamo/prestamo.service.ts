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
import { ActualizarVentaDto } from './dto/actualizarVenta.dto';
import { AbonoVentaDto } from './dto/abono.dto';
import moment from 'moment-timezone';
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
  async abonar(abonos: AbonosDto, cobrador: string) {
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
      const abonosCobrador = abonos.abonos.map((abono) => {
        return {
          ...abono,
          cobrador,
        };
      });
      return await this.prestamoModel.create({
        cliente: cliente._id,
        ruta: abonos.rutaPlana,
        producto: abonos.producto,
        cantidad: 1,
        fecha_inicio: abonos.fechaVenta,
        cuotas: abonos.pago_fechas.length,
        pago_fechas: abonos.pago_fechas,
        abono: abonosCobrador,
        total: abonos.total,
        completado: abonos.pago_fechas.length == 0,
      });
    }
    return this.handleBDerrors('Ya existe un cliente con ese documento', 409);
  }

  async abonarVenta(abono: AbonoVentaDto, cobrador: string): Promise<boolean> {
    const venta = await this.prestamoModel.findOne({ _id: abono.venta });
    if (venta) {
      venta.abono = [
        ...venta.abono,
        { fecha: abono.fecha, monto: abono.monto, cobrador: cobrador },
      ];
      await venta.save();
      return true;
    }
    return false;
  }

  async cobrar(cobro: cobroDto, cobrador: string) {
    const prestamo = await this.prestamoModel.findById(cobro.id);
    if (prestamo) {
      prestamo.abono.push({
        fecha: new Date(),
        monto: cobro.abono,
        cobrador,
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

  @Cron(CronExpression.EVERY_6_HOURS)
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
      await this.cronModel.deleteMany({
        nombre: 'Actualizo las ventas activas',
      });
      await this.cronModel.create({
        nombre: 'Actualizo las ventas activas',
        fecha: new Date().toLocaleString('es-ES'),
      });
      return `Se actualizaron ${prestamosActualizadosResolved.length} ventas`;
    } catch (error) {
      this.handleBDerrors(error);
    }
  }

  async actualizarVenta(actVenta: ActualizarVentaDto) {
    const venta = await this.prestamoModel.findById(actVenta.venta);
    if (venta) {
      try {
        await this.clienteService.actualizarRutaCliente(
          actVenta.cliente,
          actVenta.idRuta,
        );
        venta.cuotas += actVenta.cuotas;
        venta.ruta = actVenta.ruta;
        venta.producto = actVenta.producto;
        venta.pago_fechas.push(...actVenta.fechas_pago);
        await venta.save();
        return { status: true, message: 'Venta actualizada' };
      } catch (error) {
        return this.handleBDerrors(error, 500);
      }
    }
    return { status: false, message: 'No se encontró la venta' };
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
      );
      let fecha = new Date();
      fecha.setHours(fecha.getHours() - 5);
      const year = fecha.getFullYear();
      const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const day = fecha.getDate().toString().padStart(2, '0');
      const formattedDate = `^${year}-${month}-${day}`;
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      const cobrosHoy = await this.prestamoModel
        .find({
          completado: false,
          cuotas: { $gt: 1 },
        })
        .populate('cliente');
      const cobrosHoyN = await this.prestamoModel
        .find({
          $or: [
            {
              abono: {
                $elemMatch: {
                  fecha: {
                    $regex: formattedDate,
                  },
                },
              },
            },
            {
              abono: {
                $elemMatch: {
                  fecha: {
                    $gte: startOfToday,
                    $lte: endOfToday,
                  },
                },
              },
            },
          ],
        })
        .populate('cliente');
      let cobrosHoyD = [];
      cobrosHoyN.forEach((cobro: any) => {
        cobro.abono.forEach((abono) => {
          if (this.sonFechasIgualesCobro(abono.fecha, hoyFormateada)) {
            cobrosHoyD.push({
              ...cobro._doc,
              ...abono,
            });
          }
        });
      });
      return [cobrosHoy, cobrosHoyD];
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
    const cobradores = [[], []];
    const rutasGraficas = [[], []];
    const cantidadPorYear = {};

    const prestamos = await this.prestamoModel.find({
      fecha_inicio: { $regex: '.*' + year + '.*' },
    });

    const prestamosViejos = await this.prestamoModel.find({
      fecha_inicio: { $not: { $regex: '.*' + year + '.*' } },
    });
    // Recorro prestamos
    prestamos.forEach((prestamo) => {
      yearC.ventas += 1;
      yearC.total += prestamo.total;
      const mesArray = prestamo.fecha_inicio.split('-');
      const year = mesArray[0];
      if (prestamo.producto != '') {
        if (!cantidadPorYear[prestamo.producto]) {
          cantidadPorYear[prestamo.producto] = 1;
        } else {
          cantidadPorYear[prestamo.producto]++;
        }
      }
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
            const indexCobrador = cobradores[0].findIndex(
              (cobrador) => cobrador == abono.cobrador,
            );
            if (indexCobrador !== -1) {
              cobradores[1][indexCobrador] += abono.monto;
            } else {
              cobradores[0].push(abono.cobrador);
              cobradores[1].push(abono.monto);
            }
            const indexRuta = rutasGraficas[0].findIndex(
              (ruta) => ruta == prestamo.ruta,
            );
            if (indexRuta !== -1) {
              rutasGraficas[1][indexRuta] += abono.monto;
            } else {
              rutasGraficas[0].push(prestamo.ruta);
              rutasGraficas[1].push(abono.monto);
            }
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
              const indexCobrador = cobradores[0].findIndex(
                (cobrador) => cobrador == abono.cobrador,
              );
              if (indexCobrador !== -1) {
                cobradores[1][indexCobrador] += abono.monto;
              } else {
                cobradores[0].push(abono.cobrador);
                cobradores[1].push(abono.monto);
              }
              const indexRuta = rutasGraficas[0].findIndex(
                (ruta) => ruta == prestamo.ruta,
              );
              if (indexRuta !== -1) {
                rutasGraficas[1][indexRuta] += abono.monto;
              } else {
                rutasGraficas[0].push(prestamo.ruta);
                rutasGraficas[1].push(abono.monto);
              }
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
      cobradores: cobradores,
      rutas: rutasGraficas,
      graficaProductos: {
        label: Object.keys(cantidadPorYear),
        dataset: Object.values(cantidadPorYear),
      },
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
  private sonFechasIgualesCobro(fecha1: Date, fecha2: Date) {
    fecha1 = new Date(fecha1);
    fecha1 = new Date(
      Date.UTC(
        fecha1.getFullYear(),
        fecha1.getMonth(),
        fecha1.getDate(),
        0, // Hora en UTC
        0, // Minutos en UTC
        0, // Segundos en UTC
        0, // Milisegundos en UTC
      ),
    );
    return (
      fecha1.getFullYear() === fecha2.getFullYear() &&
      fecha1.getMonth() === fecha2.getMonth() &&
      fecha1.getDate() === fecha2.getDate()
    );
  }
}
