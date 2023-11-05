import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PuebloDocument = HydratedDocument<Pueblo>;

@Schema()
export class Pueblo {
  @Prop()
  nombre: string;

  @Prop()
  ciudad: string;

  @Prop()
  departamento: string;
}

export const PuebloSchema = SchemaFactory.createForClass(Pueblo);
