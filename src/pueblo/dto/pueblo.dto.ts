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
export class CreatePuebloDto {
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @IsString()
  @IsNotEmpty()
  readonly ciudad: string;

  @IsString()
  @IsNotEmpty()
  readonly departamento: string;

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

export class UpdatePuebloDto {
  @IsMongoId()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @IsString()
  @IsNotEmpty()
  readonly ciudad: string;

  @IsString()
  @IsNotEmpty()
  readonly departamento: string;

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

