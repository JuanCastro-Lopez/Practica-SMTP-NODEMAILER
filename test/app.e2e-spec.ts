import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoriasService } from '../src/categorias/categorias.service';
import { Producto } from '../src/productos/entities/producto.entity';
import { ProductosController } from '../src/productos/productos.controller';
import { ProductosService } from '../src/productos/productos.service';

describe('Productos (e2e)', () => {
  let app: INestApplication<App>;
  const productos = [
    {
      id: 1,
      nombre: 'Producto de prueba',
      descripcion: 'Registro de integración',
      precio: 12.5,
      stock: 3,
      categoria: { id: 2, nombre: 'Pruebas' },
    },
  ];
  const productoRepository = {
    find: jest.fn(),
  };

  beforeAll(async () => {
    productoRepository.find.mockResolvedValue(productos);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProductosController],
      providers: [
        ProductosService,
        {
          provide: getRepositoryToken(Producto),
          useValue: productoRepository,
        },
        {
          provide: CategoriasService,
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  it('GET /api/productos conecta el controlador con el servicio', () => {
    return request(app.getHttpServer())
      .get('/api/productos')
      .expect(200)
      .expect(productos);
  });

  afterAll(async () => {
    await app.close();
  });
});
