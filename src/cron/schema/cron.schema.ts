import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CronDocument = HydratedDocument<CronMongo>;

@Schema()
export class CronMongo {
  @Prop()
  nombre: string;

  @Prop()
  fecha: string;
}

export const CronSchema = SchemaFactory.createForClass(CronMongo);
