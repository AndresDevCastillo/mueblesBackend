import { IsDateString, IsMongoId, IsNumber } from 'class-validator';

export class AbonoVentaDto {
  @IsMongoId()
  readonly venta: string;

  @IsNumber()
  readonly monto: number;

  @IsDateString()
  readonly fecha: Date;
}
