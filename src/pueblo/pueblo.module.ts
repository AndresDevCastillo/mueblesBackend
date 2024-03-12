import { Module } from '@nestjs/common';
import { PuebloService } from './pueblo.service';
import { PuebloController } from './pueblo.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Pueblo, PuebloSchema } from './schema/pueblo.schema';
import { UsuarioModule } from 'src/usuario/usuario.module';
import { UsuarioService } from 'src/usuario/usuario.service';
import { Cliente } from 'src/cliente/schema/cliente.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Pueblo.name, schema: PuebloSchema },
      {
        name: Cliente.name,
        schema: PuebloSchema,
      },
    ]),
    UsuarioModule,
  ],
  controllers: [PuebloController],
  providers: [PuebloService, UsuarioService],
  exports: [MongooseModule],
})
export class PuebloModule {}
