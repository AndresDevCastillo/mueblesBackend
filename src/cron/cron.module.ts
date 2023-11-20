import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CronMongo, CronSchema } from './schema/cron.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CronMongo.name, schema: CronSchema }]),
  ],
  controllers: [],
  providers: [CronService],
  exports: [MongooseModule],
})
export class CronModule {}
