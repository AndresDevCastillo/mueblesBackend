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
import { Cron } from '@nestjs/schedule';
const { DateTime } = require('luxon'); 



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

  async cobrar(cobro: cobroDto) {
    let prestamo = await this.prestamoModel.findById(cobro.id);
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
        let cuotasRestantes = prestamo.cuotas - prestamo.abono.length;
        prestamo.cuota_sugerida = Math.ceil(
          (prestamo.total - abonado) / cuotasRestantes,
        );
      }
      return await prestamo.save();
    }
    return new NotFoundException('EL prestamo no existe');
  }

  @Cron('0 1 * * *')
  async actualizarCobros() {
    try {
      let prestamosVigentes = await this.prestamoModel.find({
        completado: false,
      });
      let prestamosActualizados = prestamosVigentes.map(async (prestamo) => {
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
          let cuotasRestantes = prestamo.cuotas - prestamo.abono.length;
          prestamo.cuota_sugerida = Math.ceil(
            (prestamo.total - abonado) / cuotasRestantes,
          );
        }
        return await prestamo.save();
      });
      const prestamosActualizadosResolved = await Promise.all(
        prestamosActualizados,
      );
      return prestamosActualizadosResolved;
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
      return await this.prestamoModel
        .find({ completado: false })
        .populate('cliente');
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
    let ventaDataSet = new Array(12).fill(0);
    let abonoDataSet = new Array(12).fill(0);
    const year = new Date().getFullYear();
    let semana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    let yearC = {
      fecha: year,
      total: 0,
      ventas: 0,
      abono: 0
    }
    let mes = {
      fecha: new Date().getMonth(),
      total: 0,
      ventas: 0,
      abono: 0
    }
    let hoy = {
      fecha: semana[DateTime.now().setZone('America/Bogota').weekday ],
      total: 0,
      ventas: 0,
      abono: 0
    }
    const prestamos = await this.prestamoModel.find({
    fecha_inicio: { $regex: '.*' + year + '.*' },
    });
    // Recorro prestamos
    prestamos.forEach((prestamo) => {
        yearC.ventas += 1;
        yearC.total += prestamo.total;
        const mesArray = prestamo.fecha_inicio.split('-');

        // valido las fechas de la venta
        if(parseInt(mesArray[1]) == (new Date().getMonth() + 1)) {
          mes.ventas += 1;
          mes.total += prestamo.total;
          if(this.sonFechasIguales(new Date(), new Date(prestamo.fecha_inicio))) {
            hoy.ventas += 1;
            hoy.total += prestamo.total;
          }
        }
        // Valido las fechas de los abonos
        ventaDataSet[parseInt(mesArray[1]) - 1] += prestamo.total;
        prestamo.abono.forEach(abono => {
          if(new Date().getMonth() == (new Date(abono.fecha).getMonth())) {
            mes.abono += abono.monto;
            if(this.sonFechasIguales(new Date(), new Date(abono.fecha))){
              hoy.abono += abono.monto;
            }
          }
          
          yearC.abono += abono.monto;
          const mesAbono = abono.fecha.toISOString().split('-');
          abonoDataSet[parseInt(mesAbono[1]) - 1] += abono.monto;
        })
      });

    return {
      ventas: ventaDataSet,
      abonos: abonoDataSet,
      year : yearC,
      mes: mes,
      hoy : hoy ,

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
