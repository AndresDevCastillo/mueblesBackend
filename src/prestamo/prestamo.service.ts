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
          cuota_sugerida:
            copia.cuotas == 0 ? 0 : Math.floor(copia.total / copia.cuotas),
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
        fecha:new Date(),
        monto: cobro.abono
      });
      let abonado: number = 0;
      prestamo.abono.forEach(abono => {
          abonado += abono.monto;
      });
      if (abonado >= prestamo.total){
        prestamo.completado = true;
        prestamo.mora = false;
        prestamo.cuotas_atrasadas = 0;
        prestamo.cuota_sugerida = 0;
        return prestamo.save();
      } 
        const hoy: Date = new Date();
        let montoMinimo: number = 0;
        prestamo.pago_fechas.forEach(pagoFecha => {
          if(hoy>pagoFecha.fecha) {
            montoMinimo += pagoFecha.monto;
          }
        });
        if (abonado < montoMinimo) {
          prestamo.mora = true;
          prestamo.cuotas_atrasadas = Math.ceil((prestamo.total-abonado)/prestamo.cuotas);
        }
        else {
          prestamo.mora = false;
          prestamo.cuotas_atrasadas = 0;
        }
        if(prestamo.cuotas <= prestamo.abono.length){
          prestamo.cuota_sugerida = prestamo.total - abonado;
        }
        else {
          let cuotasRestantes = prestamo.cuotas - prestamo.abono.length;
          prestamo.cuota_sugerida = Math.ceil((prestamo.total-abonado)/cuotasRestantes);
        }
        return prestamo.save();
      }
    return new NotFoundException('EL prestamo no existe');
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
      return await this.prestamoModel.find({completado: false}).populate('cliente');
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
