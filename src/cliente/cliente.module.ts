import { Module } from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { ClienteController } from './cliente.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Cliente, ClienteSchema } from './schema/cliente.schema';
import {
  Inventario,
  InventarioSchema,
} from 'src/inventario/schema/inventario.schema';
import { PrestamoService } from 'src/prestamo/prestamo.service';
import { Prestamo, PrestamoSchema } from 'src/prestamo/schema/prestamo.schema';
import { Pueblo, PuebloSchema } from 'src/pueblo/schema/pueblo.schema';
import { PrestamoModule } from 'src/prestamo/prestamo.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cliente.name, schema: ClienteSchema },
      { name: Inventario.name, schema: InventarioSchema },
      { name: Prestamo.name, schema: PrestamoSchema },
      { name: Pueblo.name, schema: PuebloSchema },
    ]),
  ],
  controllers: [ClienteController],
  providers: [ClienteService, PrestamoService],
  exports: [MongooseModule, ClienteService],
})
export class ClienteModule {}
