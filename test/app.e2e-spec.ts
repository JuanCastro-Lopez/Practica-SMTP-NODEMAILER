import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoriasService } from '../src/categorias/categorias.service';
import { CategoriasController } from '../src/categorias/categorias.controller';
import { Categoria } from '../src/categorias/entities/categoria.entity';
import { Producto } from '../src/productos/entities/producto.entity';
import { ProductosController } from '../src/productos/productos.controller';
import { ProductosService } from '../src/productos/productos.service';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RoleId } from '../src/auth/authorization/role-id.enum';

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
  const categorias = [
    {
      id: 1,
      nombre: 'Electrónica',
      descripcion: 'Productos electrónicos',
      productos: [],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];
  const categoriaRepository = {
    find: jest.fn(),
  };

  beforeAll(async () => {
    productoRepository.find.mockResolvedValue(productos);
    categoriaRepository.find.mockResolvedValue(categorias);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProductosController, CategoriasController],
      providers: [
        ProductosService,
        {
          provide: getRepositoryToken(Producto),
          useValue: productoRepository,
        },
        CategoriasService,
        {
          provide: getRepositoryToken(Categoria),
          useValue: categoriaRepository,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext): boolean => {
          const httpRequest = context.switchToHttp().getRequest<{
            user?: { rolId: RoleId };
          }>();
          httpRequest.user = { rolId: RoleId.ADMIN };
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix('api');
    await app.init();
  });

  it('returns 404 for an unknown route', () => {
    return request(app.getHttpServer()).get('/unknown').expect(404);
  });

  it('GET /api/productos conecta el controlador con el servicio', () => {
    return request(app.getHttpServer())
      .get('/api/productos')
      .expect(200)
      .expect(productos);
  });

  it('POST /api/productos devuelve 400 cuando el cuerpo no cumple el DTO', () => {
    return request(app.getHttpServer())
      .post('/api/productos')
      .send({ nombre: '', precio: -1, categoriaId: 'inválido' })
      .expect(400);
  });

  it('GET /api/categorias devuelve las categorías simuladas', () => {
    return request(app.getHttpServer())
      .get('/api/categorias')
      .expect(200)
      .expect(categorias);
  });

  afterAll(async () => {
    await app.close();
  });
});
