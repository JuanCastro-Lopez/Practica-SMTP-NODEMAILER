import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
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
    save: jest.fn(),
  };
  const categoriasService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    productoRepository.create.mockReset().mockReturnValue(producto);
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
});
