import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LoginOtpDto } from './dto/login-otp.dto';
import { solicitudOTPDto } from './dto/solicitarOTP.dto';
import { RestablecerPasswordOtpDto } from './dto/restablecer-password-otp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsuarioEntity } from 'src/usuarios/entities/usuario.entity';
import { GetUser } from './decorators/get-user.decorator';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un usuario' })
  @ApiCreatedResponse({
    description: 'El usuario fue registrado exitosamente.',
  })
  @ApiBadRequestResponse({ description: 'Los datos enviados no son válidos.' })
  @ApiConflictResponse({
    description: 'El correo electrónico o el rol ya existe o no es válido.',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('solicitar-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar código OTP por correo electrónico' })
  @ApiOkResponse({ description: 'El código OTP fue enviado exitosamente.' })
  @ApiBadRequestResponse({ description: 'El correo electrónico no es válido.' })
  async solicitarOTP(@Body() solicitarOTPDto: solicitudOTPDto) {
    return this.authService.solicitarOTP(solicitarOTPDto);
  }

  @Post('restablecer-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restablecer contraseña con un código OTP' })
  @ApiOkResponse({ description: 'La contraseña fue actualizada exitosamente.' })
  @ApiBadRequestResponse({ description: 'Los datos enviados no son válidos.' })
  @ApiUnauthorizedResponse({ description: 'El código OTP es inválido o ha expirado.' })
  async restablecerPassword(
    @Body() restablecerPasswordDto: RestablecerPasswordOtpDto,
  ) {
    return this.authService.restablecerPasswordConOTP(restablecerPasswordDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Inicio de sesión exitoso.',
    schema: {
      example: {
        message: 'Inicio de Sesion exitoso',
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'El correo o la contraseña no son válidos.' })
  @ApiUnauthorizedResponse({ description: 'Credenciales inválidas o cuenta inactiva.' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('login-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión con código OTP' })
  @ApiBody({ type: LoginOtpDto })
  @ApiOkResponse({
    description: 'Inicio de sesión exitoso.',
    schema: {
      example: {
        message: 'Inicio de sesión exitoso',
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'El correo o el código OTP no son válidos.' })
  @ApiUnauthorizedResponse({
    description: 'El código OTP es inválido, ha expirado o la cuenta no está activa.',
  })
  loginConOtp(@Body() loginOtpDto: LoginOtpDto) {
    return this.authService.loginConOtp(loginOtpDto);
  }

    //auth/perfil
    @Get('perfil')
    @UseGuards(JwtAuthGuard)
    getPerfil(@GetUser() usuario: UsuarioEntity) {
        return {
            message: 'Perfil del usuario autenticado con exito',
            user: usuario
        }
    }
}
