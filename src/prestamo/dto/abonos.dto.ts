import {
  IsArray,
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';

export class AbonosDto {
  @IsMongoId()
  readonly ruta: string;

  @IsNotEmpty()
  readonly rutaPlana: string;

  @IsNotEmpty()
  readonly direccionResidencia: string;

  @IsNotEmpty()
  readonly nombres: string;

  @IsNotEmpty()
  readonly apellidos: string;

  @IsNumber()
  readonly documento: number;

  @IsNotEmpty()
  readonly telefono: string;

  readonly correo: string;

  @IsNotEmpty()
  readonly producto: string;

  @IsDateString()
  fechaVenta: string;

  @IsArray()
  readonly pago_fechas: PagoFechasDto[];

  @IsArray()
  readonly abonos: AbonoDto[];

  @IsNumber()
  readonly total: number;
}
export class AbonoDto {
  @IsDateString()
  readonly fecha: string;

  @IsNumber()
  readonly monto: number;
}
export class PagoFechasDto {
  @IsDateString()
  readonly fecha: string;

  @IsNumber()
  readonly monto: number;
}
