import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginOtpDto {
    @ApiProperty({
        description: "Correo electrónico asociado a la cuenta",
        example: "ana@example.com",
        format: "email",
    })
    @IsEmail({}, { message: "El email debe tener un formato válido" })
    @IsNotEmpty({ message: "El email es obligatorio" })
    email!: string;

    @ApiProperty({
        description: "Código OTP recibido para iniciar sesión",
        example: "123456",
        type: String,
    })
    @IsString({ message: "El código OTP debe ser una cadena de texto" })
    @IsNotEmpty({ message: "El código OTP es obligatorio" })
    codigoOtp!: string;
}