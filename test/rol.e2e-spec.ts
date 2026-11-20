jest.mock(
  'src/usuarios/entities/usuario.entity',
  () => ({
    UsuarioEntity: class UsuarioEntity {},
  }),
  { virtual: true },
);

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RolEntity } from '../src/rol/entities/rol.entity';
import { RolController } from '../src/rol/rol.controller';
import { RolService } from '../src/rol/rol.service';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RoleId } from '../src/auth/authorization/role-id.enum';

describe('Roles (e2e)', () => {
  let app: INestApplication<App>;
  const roles = [
    { id: 1, nombre: 'Administrador' },
    { id: 2, nombre: 'Cliente' },
  ];

  const queryBuilder = {
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const rolRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
  };

  beforeAll(async () => {
    queryBuilder.getMany.mockResolvedValue(roles);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [RolController],
      providers: [
        RolService,
        {
          provide: getRepositoryToken(RolEntity),
          useValue: rolRepository,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context) => {
          context.switchToHttp().getRequest().user = {
            rolId: RoleId.ADMIN,
          };
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  it('GET /api/roles conecta el controlador con el servicio y devuelve los roles', () => {
    return request(app.getHttpServer())
      .get('/api/roles')
      .expect(200)
      .expect(roles);
  });

  afterAll(async () => {
    await app.close();
  });
});
