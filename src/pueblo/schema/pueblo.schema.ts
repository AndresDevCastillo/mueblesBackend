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

  @Prop({type: Object, default: null })
  quincenal: object;

  @Prop({type: Object, default: null })
  mensual: object;
}

export const PuebloSchema = SchemaFactory.createForClass(Pueblo);
