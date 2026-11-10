import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compile, type TemplateDelegate } from 'handlebars';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Transporter } from 'nodemailer';

export const MAIL_TRANSPORTER = 'MAIL_TRANSPORTER';

@Injectable()
export class MailService {
	private readonly logger = new Logger(MailService.name);
	private readonly otpTemplate: TemplateDelegate<{ otpCode: string }>;

	constructor(
		@Inject(MAIL_TRANSPORTER) private readonly transporter: Transporter | null,
		private readonly configService: ConfigService,
	) {
		const templatePath = join(__dirname, 'templates', 'otp.hbs');
		this.otpTemplate = compile<{ otpCode: string }>(
			readFileSync(templatePath, 'utf8'),
		);
	}

	async sentOtpEmail(email: string, otpCode: string): Promise<void> {
		if (this.configService.get<string>('MAIL_MODE', 'smtp') === 'simulation') {
			if (this.configService.get<string>('NODE_ENV') !== 'development') {
				throw new Error(
					'No se permite simular el envío OTP fuera de development.',
				);
			}

			this.logger.warn(
				`[OTP SIMULADO] Destinatario: ${email} | Código: ${otpCode}`,
			);
			return;
		}

		if (!this.transporter) {
			throw new Error('El transporte SMTP no está configurado.');
		}

		const html = this.otpTemplate({ otpCode });

		try {
			const result = await this.transporter.sendMail({
				from: this.configService.getOrThrow<string>('MAIL_FROM'),
				to: email,
				subject: 'Código de inicio de sesión',
				text: `Tu código temporal para iniciar sesión es: ${otpCode}`,
				html,
			});

			this.logger.log(`Correo OTP enviado. Message ID: ${result.messageId}`);
		} catch (error) {
			this.logger.error(
				'No fue posible enviar el correo OTP.',
				error instanceof Error ? error.stack : undefined,
			);
			throw error;
		}
	}
}
