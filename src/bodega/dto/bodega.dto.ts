import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBodegaDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  departamento: string;

  @IsNotEmpty()
  @IsString()
  ciudad: string;
}
