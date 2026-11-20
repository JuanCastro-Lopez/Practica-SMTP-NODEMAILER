import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MAIL_TRANSPORTER, MailService } from './mail.service';

describe('MailService', () => {
  let service: MailService;
  const sendMail = jest.fn();

  beforeEach(async () => {
    sendMail.mockReset().mockResolvedValue({ messageId: 'message-1' });

    const configService = {
      get: jest.fn((key: string, defaultValue?: string) => {
        if (key === 'MAIL_MODE') {
          return 'smtp';
        }

        return defaultValue;
      }),
      getOrThrow: jest.fn(() => 'noreply@example.com'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MAIL_TRANSPORTER,
          useValue: { sendMail },
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('envía el código OTP al destinatario usando SMTP', async () => {
    await service.sentOtpEmail('usuario@example.com', '123456');

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'noreply@example.com',
        to: 'usuario@example.com',
        subject: 'Código de inicio de sesión',
        text: 'Tu código temporal para iniciar sesión es: 123456',
      }),
    );
    expect(sendMail).toHaveBeenCalledTimes(1);
  });
});
