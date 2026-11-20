import { Test, TestingModule } from '@nestjs/testing';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';

describe('ProductosController', () => {
  let controller: ProductosController;
  const productos = [{ id: 1, nombre: 'Prueba' }];
  const findAll = jest.fn();

  beforeEach(async () => {
    findAll.mockReset().mockResolvedValue(productos);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductosController],
      providers: [
        {
          provide: ProductosService,
          useValue: { findAll },
        },
      ],
    }).compile();

    controller = module.get<ProductosController>(ProductosController);
  });

  it('retorna los productos obtenidos por el servicio', async () => {
    await expect(controller.findAll()).resolves.toBe(productos);
    expect(findAll).toHaveBeenCalledTimes(1);
  });
});
