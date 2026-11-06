import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
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


    @Post('login')
    @HttpCode(HttpStatus.OK)
    login(@Body() loginDto: LoginDto){
        return this.authService.login(loginDto)
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
