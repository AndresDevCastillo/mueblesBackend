import {
  IsMongoId,
  IsNotEmpty,
  IsNotEmptyObject,
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
  @IsNotEmpty()
  readonly producto: string;

  @IsString()
  @IsNotEmpty()
  readonly fecha_inicio: string;

  @IsNumber()
  @IsNotEmpty()
  readonly cuotas: number;

  @IsNotEmptyObject()
  @IsNotEmpty()
  pago_fechas: PagoFechas;

  @IsNumber()
  @IsNotEmpty()
  total: number;
}
