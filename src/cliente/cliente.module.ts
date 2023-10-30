import { Module } from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { ClienteController } from './cliente.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Cliente, ClienteSchema } from './schema/cliente.schema';

@Module({
  imports: [MongooseModule.forFeature([{name: Cliente.name, schema: ClienteSchema}])],
  controllers: [ClienteController],
  providers: [ClienteService],
  exports: [MongooseModule, ClienteService]
})
export class ClienteModule {}
