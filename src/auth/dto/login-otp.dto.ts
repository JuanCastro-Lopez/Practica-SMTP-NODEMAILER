import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Matches } from "class-validator";

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
        pattern: "^\\d{6}$",
    })
    @IsString({ message: "El código OTP debe ser una cadena de texto" })
    @Matches(/^\d{6}$/, { message: "El código OTP debe tener 6 dígitos" })
    codigoOtp!: string;
}