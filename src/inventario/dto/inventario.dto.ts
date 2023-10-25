import { IsMongoId, IsNotEmpty, IsNumber } from "class-validator";

export class CreateInventarioDto {

    @IsNotEmpty()
    @IsMongoId()
    readonly producto: string;

    @IsNotEmpty()
    @IsNumber()
    readonly cantidad: number;

}
export class UpdateInventarioDto {
    @IsNotEmpty()
    @IsMongoId()
    readonly id: string;

    @IsNotEmpty()
    @IsNumber()
    readonly cantidad: number;

    @IsNotEmpty()
    @IsNumber()
    readonly existencia: number;
}
