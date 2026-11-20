import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductoDto {
  @ApiProperty({ description: 'Nombre del producto', example: 'Café molido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del producto es obligatorio' })
  nombre!: string;

  @ApiPropertyOptional({
    description: 'Descripción del producto',
    example: 'Presentación de 500 g',
  })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ description: 'Precio del producto', example: 89.9, minimum: 0 })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio debe ser un número con máximo 2 decimales' },
  )
  @IsPositive({ message: 'El precio debe ser un número positivo mayor a 0' })
  precio!: number;

  @ApiPropertyOptional({
    description: 'Unidades disponibles en inventario',
    example: 25,
    minimum: 0,
  })
  @IsInt({ message: 'El stock debe ser un número entero' })
  @Min(0, { message: 'El stock no puede ser menor a 0' })
  @IsOptional()
  stock?: number;

  @ApiProperty({
    description: 'ID de la categoría asociada',
    example: 1,
    type: Number,
  })
  @IsInt({ message: 'El categoriaId debe ser un número entero' })
  @IsNotEmpty({ message: 'El categoriaId es obligatorio para asociar el producto a una categoría' })
  categoriaId!: number;
}
