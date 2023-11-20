import { Module } from '@nestjs/common';
import { PrestamoService } from './prestamo.service';
import { PrestamoController } from './prestamo.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Prestamo, PrestamoSchema } from './schema/prestamo.schema';
import { ClienteModule } from 'src/cliente/cliente.module';
import { ClienteService } from 'src/cliente/cliente.service';
import {
  Inventario,
  InventarioSchema,
} from 'src/inventario/schema/inventario.schema';
import { CronMongo, CronSchema } from 'src/cron/schema/cron.schema';
import { CronModule } from 'src/cron/cron.module';
import { CronService } from 'src/cron/cron.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Prestamo.name, schema: PrestamoSchema },
      { name: Inventario.name, schema: InventarioSchema },
      { name: CronMongo.name, schema: CronSchema },
    ]),
    ClienteModule,
    CronModule,
  ],
  controllers: [PrestamoController],
  providers: [PrestamoService, ClienteService, CronService],
  exports: [MongooseModule, PrestamoService],
})
export class PrestamoModule {}
