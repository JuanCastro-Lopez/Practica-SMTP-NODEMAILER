import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class RestablecerPasswordOtpDto {
  @ApiProperty({
    description: 'Correo electrónico asociado a la cuenta',
    example: 'ana@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email!: string;

  @ApiProperty({
    description: 'Código OTP vigente recibido por correo electrónico',
    example: '123456',
    pattern: '^\\d{6}$',
  })
  @IsString({ message: 'El código OTP debe ser una cadena de texto' })
  @Matches(/^\d{6}$/, { message: 'El código OTP debe tener 6 dígitos' })
  codigoOtp!: string;

  @ApiProperty({
    description: 'Nueva contraseña de al menos 6 caracteres',
    example: 'NuevaClave123',
    format: 'password',
    writeOnly: true,
    minLength: 6,
  })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La nueva contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  nuevaPassword!: string;
}
