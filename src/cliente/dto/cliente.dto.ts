import { IsMongoId, IsNotEmpty, IsNumber, IsString } from "class-validator";

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
    correo: string
    
    @IsNotEmpty()
    @IsMongoId()
    direccion: string;
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
    correo: string
    
    @IsNotEmpty()
    @IsMongoId()
    direccion: string;
}
