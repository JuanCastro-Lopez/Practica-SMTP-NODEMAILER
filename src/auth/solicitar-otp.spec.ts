import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { AuthService } from './auth.service';

describe('AuthService.solicitarOTP', () => {
  let service: AuthService;
  const findByEmail = jest.fn();
  const saveOtpCode = jest.fn();
  const sentOtpEmail = jest.fn();

  beforeEach(async () => {
    findByEmail.mockReset().mockResolvedValue(null);
    saveOtpCode.mockReset();
    sentOtpEmail.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsuariosService,
          useValue: { findByEmail, saveOtpCode },
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: MailService,
          useValue: { sentOtpEmail },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('no guarda ni envía un OTP cuando el correo no está registrado', async () => {
    await expect(
      service.solicitarOTP({ email: 'no-registrado@example.com' }),
    ).resolves.toEqual({
      message: 'Si el correo está registrado, recibirás un código OTP.',
    });

    expect(findByEmail).toHaveBeenCalledWith('no-registrado@example.com');
    expect(saveOtpCode).not.toHaveBeenCalled();
    expect(sentOtpEmail).not.toHaveBeenCalled();
  });
});