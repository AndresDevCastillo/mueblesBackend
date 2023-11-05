import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Pueblo } from 'src/pueblo/schema/pueblo.schema';

export type ClienteDocument = HydratedDocument<Cliente>;

@Schema()
export class Cliente {
  @Prop()
  documento: number;

  @Prop()
  nombres: string;

  @Prop()
  apellidos: string;

  @Prop()
  telefono: string;

  @Prop()
  correo: string;

  @Prop()
  opcRuta: string;

  @Prop({ default: null })
  diario: boolean;

  @Prop({ default: null })
  semanal: string;

  @Prop({ type: Object, default: null })
  quincenal: object;

  @Prop({ type: Object, default: null })
  mensual: object;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Pueblo' })
  direccion: Pueblo;

  @Prop({ default: false })
  mora: boolean;
}

export const ClienteSchema = SchemaFactory.createForClass(Cliente);
