import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from 'src/mail/mail.service';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
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

  it('rechaza tokens JWT inválidos, manipulados o expirados', async () => {
    const secret = '0123456789abcdef0123456789abcdef';
    const jwtService = new JwtService({ secret });
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: new ConfigService({ JWT_SECRET: secret }),
        },
        {
          provide: UsuariosService,
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    module.get<JwtStrategy>(JwtStrategy);

    const validToken = await jwtService.signAsync({
      sub: 1,
      email: 'admin@example.com',
    });
    const expiredToken = await jwtService.signAsync(
      { sub: 1, email: 'admin@example.com' },
      { expiresIn: -1 },
    );
    const tamperedToken = `${validToken.slice(0, -2)}${
      validToken[validToken.length - 2] === 'a' ? 'b' : 'a'
    }${validToken.slice(-1)}`;

    class ProtectedController {
      handler(this: void) {}
    }

    for (const token of ['invalid-token', tamperedToken, expiredToken]) {
      const context = new ExecutionContextHost(
        [{ headers: { authorization: `Bearer ${token}` } }, {}, jest.fn()],
        ProtectedController,
        ProtectedController.prototype.handler,
      );

      await expect(
        new JwtAuthGuard().canActivate(context),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    }

    await module.close();
  });
});
