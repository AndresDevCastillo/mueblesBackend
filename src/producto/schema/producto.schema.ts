import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductoDocument = HydratedDocument<Producto>;

@Schema()
export class Producto {
  @Prop()
  readonly nombre: string;

  @Prop()
  readonly estado: boolean;

  @Prop()
  readonly valor_compra: number;

  @Prop()
  readonly valor_contado: number;

  @Prop()
  readonly valor_credito: number;
}

export const ProductoSchema = SchemaFactory.createForClass(Producto);
