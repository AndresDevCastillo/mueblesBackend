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

  @Prop({ default: null })
  diario: boolean;

  @Prop({ default: null })
  semanal: string;

  @Prop({ default: null })
  quincenal: number[];

  @Prop({ default: null })
  mensual: number;
}

export const PuebloSchema = SchemaFactory.createForClass(Pueblo);
