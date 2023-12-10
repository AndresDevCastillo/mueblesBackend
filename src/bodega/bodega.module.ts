import { Module } from '@nestjs/common';
import { BodegaService } from './bodega.service';
import { BodegaController } from './bodega.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Bodega, BodegaSchema } from './schema/bodega.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Bodega.name, schema: BodegaSchema }]),
  ],
  controllers: [BodegaController],
  providers: [BodegaService],
})
export class BodegaModule {}
