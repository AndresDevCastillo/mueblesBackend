import { IsArray, IsMongoId, IsNotEmpty, IsNumber } from 'class-validator';
import { PagoFechas } from './prestamo.dto';

export class ActualizarVentaDto {
  @IsMongoId()
  readonly venta: string;

  @IsNotEmpty()
  readonly ruta: string;

  @IsNotEmpty()
  readonly producto: string;

  @IsNotEmpty()
  readonly cliente: string;

  @IsNotEmpty()
  readonly idRuta: string;

  @IsNumber()
  readonly cuotas: number;

  @IsArray()
  readonly fechas_pago: PagoFechas[];
}
