import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsObject,
  IsMongoId,
} from 'class-validator';

export class ClienteAntiguoDto {
  @IsNotEmpty()
  @IsNumber()
  readonly documento: number;

  @IsNotEmpty()
  @IsString()
  readonly nombres: string;

  @IsNotEmpty()
  @IsString()
  readonly apellidos: string;

  @IsNotEmpty()
  @IsString()
  readonly telefono: string;

  @IsNotEmpty()
  @IsString()
  readonly correo: string;

  @IsMongoId()
  readonly direccion: string;

  @IsNotEmpty()
  readonly direccionResidencia: string;
}
