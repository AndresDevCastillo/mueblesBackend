import { Module } from '@nestjs/common';
import { PuebloService } from './pueblo.service';
import { PuebloController } from './pueblo.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Pueblo, PuebloSchema } from './schema/pueblo.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Pueblo.name, schema: PuebloSchema }]),
  ],
  controllers: [PuebloController],
  providers: [PuebloService],
})
export class PuebloModule {}
