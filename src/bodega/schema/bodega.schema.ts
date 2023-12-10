import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BodegaDocument = HydratedDocument<Bodega>;

@Schema()
export class Bodega {
  @Prop()
  nombre: string;

  @Prop()
  ciudad: string;

  @Prop()
  departamento: string;
}

export const BodegaSchema = SchemaFactory.createForClass(Bodega);
