import { IsArray, IsMongoId } from 'class-validator';

export class AgregarRutaDto {
  @IsMongoId()
  readonly cobrador: string;

  @IsArray()
  readonly rutas: [];
}
