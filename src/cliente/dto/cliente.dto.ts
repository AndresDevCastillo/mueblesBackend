import {
  IsArray,
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
} from 'class-validator';
export class PrestamoDto {
  @IsMongoId()
  readonly inventario: string;

  @IsNotEmpty()
  readonly producto: string;

  @IsNumber()
  readonly cantidad: number;

  @IsNumber()
  readonly cuotas: number;

  @IsNumber()
  readonly total: number;

  @IsDate()
  readonly fecha_inicio: Date;

  @IsArray()
  readonly pago_fechas: PagoFechaDto[];
}

export class PagoFechaDto {
  @IsDate()
  readonly fecha: Date;

  @IsNumber()
  readonly monto: number;
}

export class DireccionDto {
  @IsMongoId()
  readonly _id: string;

  @IsNotEmpty()
  readonly nombre: string;
}

export class CreateClienteDto {
  @IsNotEmpty()
  @IsNumber()
  readonly documento: number;

  @IsNotEmpty()
  @IsString()
  nombres: string;

  @IsNotEmpty()
  @IsString()
  apellidos: string;

  @IsNotEmpty()
  @IsString()
  telefono: string;

  @IsNotEmpty()
  @IsString()
  correo: string;

  @IsObject()
  direccion: DireccionDto;

  @IsObject()
  venta: PrestamoDto;
}
export class UpdateClienteDto {
  @IsNotEmpty()
  @IsMongoId()
  readonly id: string;

  @IsNotEmpty()
  @IsNumber()
  readonly documento: number;

  @IsNotEmpty()
  @IsString()
  nombres: string;

  @IsNotEmpty()
  @IsString()
  apellidos: string;

  @IsNotEmpty()
  @IsString()
  telefono: string;

  @IsNotEmpty()
  @IsString()
  correo: string;

  @IsNotEmpty()
  @IsMongoId()
  direccion: string;
}
