import {
  IsArray,
  IsBoolean,
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
  readonly nombre: string;

  @IsString()
  readonly ciudad: string;

  @IsString()
  readonly departamento: string;

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
  @IsString()
  id: string;

  @IsString()
  readonly nombre: string;

  @IsString()
  readonly ciudad: string;

  @IsString()
  readonly departamento: string;

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

