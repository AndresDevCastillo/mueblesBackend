import { IsNotEmpty, IsString } from 'class-validator';

export class UsuarioDto {
  @IsNotEmpty()
  @IsString()
  readonly nombre: string;

  @IsNotEmpty()
  @IsString()
  readonly usuario: string;

  @IsNotEmpty()
  @IsString()
  contrasena: string;

  @IsNotEmpty()
  @IsString()
  readonly rol: string;
}

export class UserLoginDto {
  @IsString()
  readonly usuario: string;

  @IsString()
  readonly contrasena: string;
}
