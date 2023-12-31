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

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Pueblo' })
  direccion: Pueblo;

  @Prop()
  direccionResidencia: string;
  
  @Prop({ default: false })
  mora: boolean;

  @Prop()
  creacion: string;
}

export const ClienteSchema = SchemaFactory.createForClass(Cliente);
