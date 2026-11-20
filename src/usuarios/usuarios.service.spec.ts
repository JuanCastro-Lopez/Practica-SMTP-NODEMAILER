import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RolService } from '../rol/rol.service';
import { UsuarioEntity } from './entities/usuario.entity';
import { UsuariosService } from './usuarios.service';

describe('UsuariosService', () => {
  let service: UsuariosService;

  const usuariosRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const rolService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        {
          provide: getRepositoryToken(UsuarioEntity),
          useValue: usuariosRepository,
        },
        {
          provide: RolService,
          useValue: rolService,
        },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
  });

  it('rechaza la creación cuando el correo electrónico ya está registrado', async () => {
    const dto = {
      nombre: 'Jairo Trejos',
      email: 'duplicado@example.com',
      password: 'Password123',
      rolId: 1,
    };

    usuariosRepository.findOne.mockResolvedValue({
      id: 10,
      email: 'duplicado@example.com',
    });

    await expect(service.create(dto as never)).rejects.toThrow(
      ConflictException,
    );
    expect(rolService.findOne).not.toHaveBeenCalled();
    expect(usuariosRepository.save).not.toHaveBeenCalled();
  });

  it('crea el usuario con su rol asignado y omite la contraseña en la respuesta', async () => {
    const dto = {
      nombre: 'Jairo Trejos',
      email: 'nuevo@example.com',
      password: 'Password123',
      rolId: 2,
    };
    const rol = { id: 2, nombre: 'Cliente' };
    const usuarioGuardado = {
      id: 5,
      nombre: 'Jairo Trejos',
      email: 'nuevo@example.com',
      password: 'Password123',
      rol,
    };

    usuariosRepository.findOne.mockResolvedValue(null);
    rolService.findOne.mockResolvedValue(rol);
    usuariosRepository.create.mockReturnValue({ ...dto, rol });
    usuariosRepository.save.mockResolvedValue(usuarioGuardado);

    const resultado = await service.create(dto);

    expect(rolService.findOne).toHaveBeenCalledWith(2);
    expect(usuariosRepository.save).toHaveBeenCalledTimes(1);
    expect(resultado).toEqual({
      mesage: 'Usuario creado exitosamente',
      user: {
        id: 5,
        nombre: 'Jairo Trejos',
        email: 'nuevo@example.com',
        rol,
      },
    });
    expect(resultado.user).not.toHaveProperty('password');
  });
});
