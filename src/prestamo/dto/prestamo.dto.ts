import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
export class PagoFechas {
  readonly fecha: Date;
  readonly monto: number;
}
export class Abonos {
  readonly fecha: Date;
  readonly monto: number;
  readonly cobrador: string;
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

  @IsMongoId()
  readonly inventario: string;

  @IsNumber()
  readonly cantidad: number;

  @IsString()
  @IsNotEmpty()
  readonly fecha_inicio: Date;

  @IsNumber()
  @IsNotEmpty()
  readonly cuotas: number;

  @IsArray()
  pago_fechas: PagoFechas[];

  @IsNumber()
  @IsNotEmpty()
  total: number;
}

export class cobroDto {
  @IsMongoId()
  @IsNotEmpty()
  id: string;

  @IsNumber()
  @IsNotEmpty()
  abono: number;
}
