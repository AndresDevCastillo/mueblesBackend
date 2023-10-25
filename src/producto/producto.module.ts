import { Module } from '@nestjs/common';
import { ProductoService } from './producto.service';
import { ProductoController } from './producto.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Producto, ProductoSchema } from './schema/producto.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Producto.name, schema: ProductoSchema },
    ]),
  ],
  controllers: [ProductoController],
  providers: [ProductoService],
  exports: [ProductoService, MongooseModule]
})
export class ProductoModule {}
