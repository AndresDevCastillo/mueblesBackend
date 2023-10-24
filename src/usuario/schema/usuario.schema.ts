import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

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
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
