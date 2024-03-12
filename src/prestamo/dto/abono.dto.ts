import { IsDateString, IsMongoId, IsNumber, IsString } from 'class-validator';

export class AbonoVentaDto {
  @IsMongoId()
  readonly venta: string;

  @IsNumber()
  readonly monto: number;

  @IsDateString()
  readonly fecha: Date;
}

export class dateAbonoFind {
    @IsString()
    date: string;
}
