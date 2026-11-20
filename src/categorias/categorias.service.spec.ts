import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity';
import { CategoriasService } from './categorias.service';

describe('CategoriasService', () => {
  let service: CategoriasService;

  const categoriaRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriasService,
        {
          provide: getRepositoryToken(Categoria),
          useValue: categoriaRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriasService>(CategoriasService);
  });

  it('rechaza la creación de una categoría con nombre duplicado', async () => {
    categoriaRepository.findOne.mockResolvedValue({
      id: 1,
      nombre: 'Electrónica',
    });

    await expect(
      service.create({ nombre: 'Electrónica' }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(categoriaRepository.findOne).toHaveBeenCalledWith({
      where: { nombre: 'Electrónica' },
    });
    expect(categoriaRepository.create).not.toHaveBeenCalled();
    expect(categoriaRepository.save).not.toHaveBeenCalled();
  });

  it('lanza NotFoundException cuando la categoría no existe', async () => {
    categoriaRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(categoriaRepository.findOne).toHaveBeenCalledWith({
      where: { id: 999 },
      relations: { productos: true },
    });
  });
});
