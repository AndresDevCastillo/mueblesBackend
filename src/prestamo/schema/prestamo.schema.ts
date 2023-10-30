import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Cliente } from 'src/cliente/schema/cliente.schema';
import { Abonos, PagoFechas } from '../dto/prestamo.dto';

export type PrestamoDocument = HydratedDocument<Prestamo>;

@Schema()
export class Prestamo {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
  })
  cliente: Cliente;

  @Prop()
  ruta: string;

  @Prop()
  producto: string;

  @Prop()
  fecha_inicio: string;

  @Prop()
  cuotas: number;

  @Prop()
  pago_fechas: PagoFechas[];

  @Prop()
  abono: Abonos[];

  @Prop({ default: 0 })
  cuotas_atrasadas: number;

  @Prop({ default: false })
  completado: boolean;

  @Prop({ default: false })
  mora: boolean;

  @Prop()
  total: number;
}

export const PrestamoSchema = SchemaFactory.createForClass(Prestamo);
