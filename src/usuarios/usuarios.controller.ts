import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('usuarios')
@ApiTags('Usuarios')
export class UsuariosController {}
