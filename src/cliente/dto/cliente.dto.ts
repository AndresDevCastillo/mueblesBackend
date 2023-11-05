import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class quincenalDto {
  @IsString()
  dia: string;

  @IsArray()
  semanas: number[];
}
export class mensualDto {
  @IsString()
  dia: string;

  @IsNumber()
  semanas: number;
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

  @IsNotEmpty()
  @IsMongoId()
  direccion: string;

  @IsString()
  @IsNotEmpty()
  opcRuta: string;

  @IsBoolean()
  @IsOptional()
  readonly diario: boolean;

  @IsString()
  @IsOptional()
  readonly semanal: string;

  @IsObject()
  @IsOptional()
  readonly quincenal: quincenalDto;

  @IsObject()
  @IsOptional()
  readonly mensual: mensualDto;

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


  @IsString()
  @IsNotEmpty()
  opcRuta: string;

  @IsBoolean()
  @IsOptional()
  readonly diario: boolean;

  @IsString()
  @IsOptional()
  readonly semanal: string;

  @IsObject()
  @IsOptional()
  readonly quincenal: quincenalDto;

  @IsObject()
  @IsOptional()
  readonly mensual: mensualDto;
}
