import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MAIL_TRANSPORTER, MailService } from './mail.service';

describe('MailService - modo de simulación', () => {
  let service: MailService;
  const sendMail = jest.fn();

  beforeEach(async () => {
    sendMail.mockReset();

    const configService = {
      get: jest.fn((key: string, defaultValue?: string) => {
        if (key === 'MAIL_MODE') {
          return 'simulation';
        }
        if (key === 'NODE_ENV') {
          return 'production';
        }
        return defaultValue;
      }),
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

  it('impide simular el envío OTP fuera de development', async () => {
    await expect(
      service.sentOtpEmail('usuario@example.com', '123456'),
    ).rejects.toThrow(
      'No se permite simular el envío OTP fuera de development.',
    );

    expect(sendMail).not.toHaveBeenCalled();
  });
});
