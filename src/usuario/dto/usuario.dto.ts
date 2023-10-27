import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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

export class UpdateUsuarioDto extends UsuarioDto {
  @IsMongoId()
  readonly id: string;

  @IsString()
  @IsOptional()
  readonly contrasena: string;

  @IsString()
  @IsOptional()
  readonly usuario: string;
}
