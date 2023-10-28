import { Module } from '@nestjs/common';
import { PrestamoService } from './prestamo.service';
import { PrestamoController } from './prestamo.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Prestamo, PrestamoSchema } from './schema/prestamo.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Prestamo.name, schema: PrestamoSchema },
    ]),
  ],
  controllers: [PrestamoController],
  providers: [PrestamoService],
})
export class PrestamoModule {}
