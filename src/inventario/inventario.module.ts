import { Module } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { InventarioController } from './inventario.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Inventario, InventarioSchema } from './schema/inventario.schema';
import { ProductoModule } from 'src/producto/producto.module';
import { ProductoService } from 'src/producto/producto.service';

@Module({
  imports: [
    ProductoModule,
    MongooseModule.forFeature([{name: Inventario.name, schema: InventarioSchema}])],
  controllers: [InventarioController],
  providers: [InventarioService, ProductoService],
  exports: [MongooseModule]
})
export class InventarioModule {}
