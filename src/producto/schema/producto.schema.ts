import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductoDocument = HydratedDocument<Producto>;

@Schema()
export class Producto {
  @Prop()
  nombre: string;

  @Prop()
  estado: boolean;

  @Prop()   
  valor_compra: number;

  @Prop()
  valor_contado: number;

  @Prop()
  valor_credito: number;
}

export const ProductoSchema = SchemaFactory.createForClass(Producto);
