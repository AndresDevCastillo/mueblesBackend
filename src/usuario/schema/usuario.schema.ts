import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Pueblo } from 'src/pueblo/schema/pueblo.schema';

export type UsuarioDocument = HydratedDocument<Usuario>;

@Schema()
export class Usuario {
  @Prop()
  nombre: string;

  @Prop()
  usuario: string;

  @Prop()
  contrasena: string;

  @Prop()
  rol: string;

  @Prop({ type: Array, default: [], ref: 'Pueblo' })
  rutas: Pueblo[];
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
