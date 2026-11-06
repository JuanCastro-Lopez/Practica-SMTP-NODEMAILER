import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
  ) {}

  async create(createCategoriaDto: CreateCategoriaDto) {
    const existe = await this.categoriaRepository.findOne({
      where: { nombre: createCategoriaDto.nombre },
    });

    if (existe) {
      throw new ConflictException(
        `La categoría con el nombre "${createCategoriaDto.nombre}" ya existe`,
      );
    }

    const categoria = this.categoriaRepository.create(createCategoriaDto);
    const guardada = await this.categoriaRepository.save(categoria);

    return {
      message: 'Categoría creada exitosamente',
      data: guardada,
    };
  }

  async findAll(): Promise<Categoria[]> {
    return await this.categoriaRepository.find({
      relations: { productos: true },
    });
  }

  async findOne(id: number): Promise<Categoria> {
    const categoria = await this.categoriaRepository.findOne({
      where: { id },
      relations: { productos: true },
    });

    if (!categoria) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    return categoria;
  }

  async update(id: number, updateCategoriaDto: UpdateCategoriaDto) {
    // Validamos primero que la categoría exista
    const categoria = await this.findOne(id);

    // Si intenta actualizar el nombre, validamos que no esté duplicado
    if (
      updateCategoriaDto.nombre &&
      updateCategoriaDto.nombre !== categoria.nombre
    ) {
      const existe = await this.categoriaRepository.findOne({
        where: { nombre: updateCategoriaDto.nombre },
      });

      if (existe) {
        throw new ConflictException(
          `La categoría con el nombre "${updateCategoriaDto.nombre}" ya existe`,
        );
      }
    }

    this.categoriaRepository.merge(categoria, updateCategoriaDto);
    const guardada = await this.categoriaRepository.save(categoria);

    return {
      message: 'Categoría actualizada exitosamente',
      data: guardada,
    };
  }

  async remove(id: number): Promise<{ message: string }> {
    const categoria = await this.findOne(id);
    await this.categoriaRepository.remove(categoria);
    return {
      message: `Categoría "${categoria.nombre}" con ID ${id} eliminada exitosamente`,
    };
  }
}
