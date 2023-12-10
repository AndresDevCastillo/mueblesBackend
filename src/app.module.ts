import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductoModule } from './producto/producto.module';
import { UsuarioModule } from './usuario/usuario.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PuebloModule } from './pueblo/pueblo.module';
import { InventarioModule } from './inventario/inventario.module';
import { ClienteModule } from './cliente/cliente.module';
import { PrestamoModule } from './prestamo/prestamo.module';
import configuration from './config/configuration';
import { ScheduleModule } from '@nestjs/schedule';
import { CronModule } from './cron/cron.module';
import { BodegaModule } from './bodega/bodega.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('URL_MONGODB'),
      }),
    }),
    ProductoModule,
    UsuarioModule,
    AuthModule,
    PuebloModule,
    InventarioModule,
    ClienteModule,
    PrestamoModule,
    CronModule,
    BodegaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
