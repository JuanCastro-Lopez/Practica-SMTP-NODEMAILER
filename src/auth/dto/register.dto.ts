import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'Nombre del usuario', example: 'Ana Pérez' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser un texto' })
  nombre!: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'ana@example.com',
    format: 'email',
  })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  @IsEmail({}, { message: 'El email debe ser un correo electrónico válido' })
  email!: string;

  @ApiProperty({
    description: 'Contraseña de al menos 6 caracteres',
    example: 'secreto123',
    format: 'password',
    writeOnly: true,
    minLength: 6,
  })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsString({ message: 'La contraseña debe ser un texto' })
  password!: string;

  @ApiProperty({
    description: 'Identificador numérico del rol asignado',
    example: 1,
    type: Number,
  })
  @IsNumber({}, { message: 'El rolId debe ser un número' })
  rolId!: number;
}
