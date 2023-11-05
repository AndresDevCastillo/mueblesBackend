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

}

