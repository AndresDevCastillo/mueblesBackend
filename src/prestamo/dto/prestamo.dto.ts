import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
export class PagoFechas {
  readonly fecha: string;
  readonly monto: number;
}
export class Abonos {
  readonly fecha: string;
  readonly monto: number;
}
export class CreatePrestamoDto {
  @IsMongoId()
  @IsNotEmpty()
  readonly cliente: string;

  @IsString()
  @IsNotEmpty()
  readonly ruta: string;

  @IsString()
  readonly producto: string;

  @IsString()
  @IsNotEmpty()
  readonly fecha_inicio: string;

  @IsNumber()
  @IsNotEmpty()
  readonly cuotas: number;

  @IsArray()
  pago_fechas: PagoFechas[];

  @IsNumber()
  @IsNotEmpty()
  total: number;
}
