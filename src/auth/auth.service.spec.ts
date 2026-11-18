import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from 'src/mail/mail.service';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const findByEmail = jest.fn();
  const signAsync = jest.fn();

  beforeEach(async () => {
    findByEmail.mockReset().mockResolvedValue({
      id: 1,
      email: 'inactivo@example.com',
      activo: false,
      password: 'hash',
    });
    signAsync.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsuariosService,
          useValue: { findByEmail },
        },
        {
          provide: JwtService,
          useValue: { signAsync },
        },
        {
          provide: MailService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('rechaza el inicio de sesión de una cuenta inactiva', async () => {
    await expect(
      service.login({
        email: 'inactivo@example.com',
        password: 'Password123',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(findByEmail).toHaveBeenCalledWith('inactivo@example.com', true);
    expect(signAsync).not.toHaveBeenCalled();
  });
});
