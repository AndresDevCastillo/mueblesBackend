import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProductoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsNumber()
  @IsNotEmpty()
  valor_compra: number;

  @IsNumber()
  @IsNotEmpty()
  valor_contado: number;

  @IsNumber()
  @IsNotEmpty()
  valor_credito: number;
}

export class UpdateProductoDto {
  @IsString()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsNumber()
  @IsNotEmpty()
  valor_compra: number;

  @IsNumber()
  @IsNotEmpty()
  valor_contado: number;

  @IsNumber()
  @IsNotEmpty()
  valor_credito: number;
}
