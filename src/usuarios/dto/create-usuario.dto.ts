import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUsuarioDto {
  @ApiProperty({ description: 'Nombre del usuario', example: 'Ana Pérez' })
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'ana@example.com',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: 'Contraseña de al menos 6 caracteres',
    example: 'secreto123',
    format: 'password',
    writeOnly: true,
    minLength: 6,
  })
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @ApiProperty({
    description: 'Identificador numérico del rol asignado',
    example: 1,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  rolId!: number;
}
