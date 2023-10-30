import { Module } from '@nestjs/common';
import { PrestamoService } from './prestamo.service';
import { PrestamoController } from './prestamo.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Prestamo, PrestamoSchema } from './schema/prestamo.schema';
import { ClienteModule } from 'src/cliente/cliente.module';
import { ClienteService } from 'src/cliente/cliente.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Prestamo.name, schema: PrestamoSchema },
    ]),
    ClienteModule
  ],
  controllers: [PrestamoController],
  providers: [PrestamoService, ClienteService]
})
export class PrestamoModule {}
