import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Producto } from 'src/producto/schema/producto.schema';

export type InventarioDocument = HydratedDocument<Inventario>;

@Schema()
export class Inventario {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
  })
  producto: Producto;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bodega',
  })
  bodega: Producto;

  @Prop()
  cantidad: number;

  @Prop()
  existencias: number;
}

export const InventarioSchema = SchemaFactory.createForClass(Inventario);
