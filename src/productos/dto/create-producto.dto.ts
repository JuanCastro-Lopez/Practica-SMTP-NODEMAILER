import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductoDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del producto es obligatorio' })
  nombre: string;

  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsOptional()
  descripcion?: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio debe ser un número con máximo 2 decimales' },
  )
  @IsPositive({ message: 'El precio debe ser un número positivo mayor a 0' })
  precio: number;

  @IsInt({ message: 'El stock debe ser un número entero' })
  @Min(0, { message: 'El stock no puede ser menor a 0' })
  @IsOptional()
  stock?: number;

  @IsInt({ message: 'El categoriaId debe ser un número entero' })
  @IsNotEmpty({ message: 'El categoriaId es obligatorio para asociar el producto a una categoría' })
  categoriaId: number;
}
