import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

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

  @IsArray()
  @IsOptional()
  readonly quincenal: number[];

  @IsNumber()
  @IsOptional()
  readonly mensual: number;
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

  @IsArray()
  @IsOptional()
  readonly quincenal: number[];

  @IsNumber()
  @IsOptional()
  readonly mensual: number;
}
