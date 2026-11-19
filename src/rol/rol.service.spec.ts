import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RolEntity } from './entities/rol.entity';
import { RolService } from './rol.service';

describe('RolService', () => {
  let service: RolService;

  const queryBuilder = {
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };

  const rolRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    rolRepository.createQueryBuilder.mockReturnValue(queryBuilder);
    queryBuilder.where.mockReturnThis();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolService,
        {
          provide: getRepositoryToken(RolEntity),
          useValue: rolRepository,
        },
      ],
    }).compile();

    service = module.get<RolService>(RolService);
  });

  it('crea y guarda un rol cuando el nombre no está duplicado', async () => {
    const dto = { nombre: 'Supervisor' };
    const rolGuardado = { id: 3, nombre: 'Supervisor' };

    queryBuilder.getOne.mockResolvedValue(null);
    rolRepository.create.mockReturnValue(dto);
    rolRepository.save.mockResolvedValue(rolGuardado);

    const resultado = await service.create(dto as never);

    expect(queryBuilder.where).toHaveBeenCalledWith('rol.nombre = :nombre', {
      nombre: 'Supervisor',
    });
    expect(rolRepository.create).toHaveBeenCalledWith(dto);
    expect(rolRepository.save).toHaveBeenCalledWith(dto);
    expect(resultado).toEqual({
      message: 'Rol creado exitosamente',
      data: rolGuardado,
    });
  });
});