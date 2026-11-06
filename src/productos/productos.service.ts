import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { CategoriasService } from '../categorias/categorias.service';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    // Inyectamos el servicio de categorías para reutilizar su lógica y evitar duplicidad de consultas directas
    private readonly categoriasService: CategoriasService,
  ) {}

  async create(createProductoDto: CreateProductoDto) {
    const { categoriaId, ...productoData } = createProductoDto;

    // Consultamos la categoría usando su propio servicio (lanza NotFoundException si no existe)
    const categoria = await this.categoriasService.findOne(categoriaId);

    const producto = this.productoRepository.create({
      ...productoData,
      categoria,
    });

    const guardado = await this.productoRepository.save(producto);

    return {
      message: 'Producto creado exitosamente',
      data: guardado,
    };
  }

  async findAll(): Promise<Producto[]> {
    return await this.productoRepository.find({
      relations: { categoria: true },
    });
  }

  async findOne(id: number): Promise<Producto> {
    const producto = await this.productoRepository.findOne({
      where: { id },
      relations: { categoria: true },
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return producto;
  }

  async update(id: number, updateProductoDto: UpdateProductoDto) {
    // Validamos primero que el producto exista
    const producto = await this.findOne(id);
    const { categoriaId, ...productoData } = updateProductoDto;

    // Si envían un nuevo categoriaId, validamos la categoría con su servicio
    if (categoriaId) {
      const categoria = await this.categoriasService.findOne(categoriaId);
      producto.categoria = categoria;
    }

    this.productoRepository.merge(producto, productoData);
    const guardado = await this.productoRepository.save(producto);

    return {
      message: 'Producto actualizado exitosamente',
      data: guardado,
    };
  }

  async remove(id: number): Promise<{ message: string }> {
    const producto = await this.findOne(id);
    await this.productoRepository.remove(producto);
    return {
      message: `Producto "${producto.nombre}" con ID ${id} eliminado exitosamente`,
    };
  }
}
