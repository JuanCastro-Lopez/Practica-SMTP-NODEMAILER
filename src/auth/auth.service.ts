import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { solicitudOTPDto } from './dto/solicitarOTP.dto';
import { randomInt } from 'node:crypto';
import { RestablecerPasswordOtpDto } from './dto/restablecer-password-otp.dto';
import { LoginOtpDto } from './dto/login-otp.dto';

const MAX_OTP_ATTEMPTS = 5;

@Injectable()
export class AuthService {
    constructor(
        private readonly usuariosService: UsuariosService,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService
    ) { }

    async register(registerDto: RegisterDto) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

        const newUser = await this.usuariosService.create({
            ...registerDto,
            password: hashedPassword,
        })

        return {
            message: 'Usuario registrado exitosamente',
            user: newUser,
        }
    }

    async login(loginDto: LoginDto) {
        //1. Buscar el usuario por email
        const usuario = await this.usuariosService.findByEmail(loginDto.email, true)

        if (!usuario) {
            throw new UnauthorizedException(`El correo no existe`)
        }

        //2. Validar que la cuenta este activa
        if (!usuario.activo) {
            throw new UnauthorizedException(`La cuenta no se encuentra activa`)
        }

        //3. Comparar la contraseña enviada desde el dto con el hash de la BD
        const passwordValido = await bcrypt.compare(
            loginDto.password, //Este es el atributo del DTO
            usuario.password //Este es el hash de la BD
        )

        if (!passwordValido) {
            throw new UnauthorizedException(`Credenciales invalidas`)
        }

        //4. Crear el Payload del JWT
        const payload = {
            sub: usuario.id,
            email: usuario.email,
            rol: usuario.rol?.nombre
        }

        //5. Firmar el token
        const token = await this.jwtService.signAsync(payload);

        return {
            message: "Inicio de Sesion exitoso",
            access_token: token,
        }
    }

    async loginConOtp(loginOtpDto: LoginOtpDto) {
        const now = new Date();
        const usuario = await this.usuariosService.findByEmail(loginOtpDto.email);

        if (
            !usuario ||
            !usuario.activo ||
            !usuario.otpCode ||
            !usuario.otpExpiresAt ||
            usuario.otpExpiresAt <= now ||
            usuario.otpAttempts >= MAX_OTP_ATTEMPTS
        ) {
            throw new UnauthorizedException('El código OTP es inválido o ha expirado');
        }

        const otpMatches = await bcrypt.compare(loginOtpDto.codigoOtp, usuario.otpCode);

        if (!otpMatches) {
            await this.usuariosService.incrementOtpAttempts(
                usuario.id,
                usuario.otpCode,
                now,
                MAX_OTP_ATTEMPTS
            );
            throw new UnauthorizedException('El código OTP es inválido o ha expirado');
        }

        const otpConsumed = await this.usuariosService.consumeOtpCode(
            usuario.id,
            usuario.otpCode,
            now,
            MAX_OTP_ATTEMPTS
        );

        if (!otpConsumed) {
            throw new UnauthorizedException('El código OTP es inválido o ha expirado');
        }

        const payload = {
            sub: usuario.id,
            email: usuario.email,
            rol: usuario.rol?.nombre
        };
        const token = await this.jwtService.signAsync(payload);

        return {
            message: 'Inicio de sesión exitoso',
            access_token: token,
        };
    }

    async solicitarOTP(solicitarOTPDto: solicitudOTPDto) {
        const usuario = await this.usuariosService.findByEmail(solicitarOTPDto.email);

        if (!usuario) {
            return {
                message: 'Si el correo está registrado, recibirás un código OTP.',
            };
        }

        const otpCode = randomInt(100000, 1000000).toString();
        const otpCodeHash = await bcrypt.hash(otpCode, 10);
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await this.usuariosService.saveOtpCode(usuario.id, otpCodeHash, otpExpiresAt);
        await this.mailService.sentOtpEmail(usuario.email, otpCode);

        return {
            message: 'Si el correo está registrado, recibirás un código OTP.',
        };
    }

    async restablecerPasswordConOTP(dto: RestablecerPasswordOtpDto) {
        const now = new Date();
        const usuario = await this.usuariosService.findByEmail(dto.email);

        if (
            !usuario ||
            !usuario.otpCode ||
            !usuario.otpExpiresAt ||
            usuario.otpExpiresAt <= now ||
            usuario.otpAttempts >= MAX_OTP_ATTEMPTS
        ) {
            throw new UnauthorizedException('El código OTP es inválido o ha expirado');
        }

        const otpMatches = await bcrypt.compare(dto.codigoOtp, usuario.otpCode);

        if (!otpMatches) {
            await this.usuariosService.incrementOtpAttempts(
                usuario.id,
                usuario.otpCode,
                now,
                MAX_OTP_ATTEMPTS
            );
            throw new UnauthorizedException('El código OTP es inválido o ha expirado');
        }

        const hashedPassword = await bcrypt.hash(dto.nuevaPassword, 10);
        const otpValido = await this.usuariosService.updatePasswordWithOtp(
            dto.email,
            usuario.otpCode,
            hashedPassword,
            now,
            MAX_OTP_ATTEMPTS
        );

        if (!otpValido) {
            throw new UnauthorizedException('El código OTP es inválido o ha expirado');
        }

        return {
            message: 'La contraseña fue actualizada exitosamente',
        };
    }
}
