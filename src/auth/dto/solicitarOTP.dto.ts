import { IsEmail, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class solicitudOTPDto {
    @ApiProperty({
        description: "Correo electrónico al que se enviará el código OTP",
        example: "ana@example.com",
        format: "email",
    })
    @IsEmail()
    @IsNotEmpty()
    email!: string;
}