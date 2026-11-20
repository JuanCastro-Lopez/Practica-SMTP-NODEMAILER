import { Test, TestingModule } from '@nestjs/testing';
import { RolController } from './rol.controller';
import { RolService } from './rol.service';

describe('RolController', () => {
  let controller: RolController;
  const rolService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolController],
      providers: [
        {
          provide: RolService,
          useValue: rolService,
        },
      ],
    }).compile();

    controller = module.get<RolController>(RolController);
  });

  it('retorna el rol obtenido por el servicio según el ID', async () => {
    const rolEsperado = { id: 1, nombre: 'Administrador' };
    rolService.findOne.mockResolvedValue(rolEsperado);

    const resultado = await controller.findOne(1);

    expect(rolService.findOne).toHaveBeenCalledTimes(1);
    expect(rolService.findOne).toHaveBeenCalledWith(1);
    expect(resultado).toEqual(rolEsperado);
  });
});
