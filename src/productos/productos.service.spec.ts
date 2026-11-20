import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CategoriasService } from '../categorias/categorias.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { Producto } from './entities/producto.entity';
import { ProductosService } from './productos.service';

describe('ProductosService', () => {
  let service: ProductosService;

  const categoria = { id: 2, nombre: 'Pruebas' };
  const dto: CreateProductoDto = {
    nombre: 'Producto de prueba',
    precio: 12.5,
    stock: 3,
    categoriaId: categoria.id,
  };
  const producto = { ...dto, categoria };
  const guardado = { ...producto, id: 1 };
  const productoRepository = {
    create: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
    save: jest.fn(),
  };
  const categoriasService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    productoRepository.create.mockReset().mockReturnValue(producto);
    productoRepository.findOne.mockReset().mockResolvedValue(null);
    productoRepository.merge.mockReset();
    productoRepository.remove.mockReset();
    productoRepository.save.mockReset().mockResolvedValue(guardado);
    categoriasService.findOne.mockReset().mockResolvedValue(categoria);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductosService,
        {
          provide: getRepositoryToken(Producto),
          useValue: productoRepository,
        },
        {
          provide: CategoriasService,
          useValue: categoriasService,
        },
      ],
    }).compile();

    service = module.get<ProductosService>(ProductosService);
  });

  it('busca la categoría y guarda el producto asociado', async () => {
    await expect(service.create(dto)).resolves.toEqual({
      message: 'Producto creado exitosamente',
      data: guardado,
    });

    expect(categoriasService.findOne).toHaveBeenCalledWith(categoria.id);
    expect(productoRepository.create).toHaveBeenCalledWith({
      nombre: dto.nombre,
      precio: dto.precio,
      stock: dto.stock,
      categoria,
    });
    expect(productoRepository.save).toHaveBeenCalledWith(producto);
  });

  it('lanza NotFoundException al actualizar o eliminar un producto inexistente sin modificar el repositorio', async () => {
    await expect(
      service.update(999, { nombre: 'No existe' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.remove(999)).rejects.toBeInstanceOf(NotFoundException);

    expect(productoRepository.merge).not.toHaveBeenCalled();
    expect(productoRepository.save).not.toHaveBeenCalled();
    expect(productoRepository.remove).not.toHaveBeenCalled();
  });
});
