import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { RolService } from './rol.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/authorization/roles.decorator';
import { RoleId } from '../auth/authorization/role-id.enum';

@Controller('roles')
@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleId.ADMIN)
@ApiUnauthorizedResponse({ description: 'Falta un JWT válido.' })
@ApiForbiddenResponse({ description: 'Solo el administrador puede gestionar roles.' })
export class RolController {
  constructor(private readonly rolService: RolService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un rol (solo administrador)' })
  @ApiCreatedResponse({ description: 'Rol creado exitosamente.' })
  @ApiBadRequestResponse({ description: 'Los datos enviados no son válidos.' })
  @ApiConflictResponse({ description: 'Ya existe un rol con ese nombre.' })
  create(@Body() createRolDto: CreateRolDto) {
    return this.rolService.create(createRolDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar roles (solo administrador)' })
  @ApiOkResponse({ description: 'Lista de roles.' })
  findAll() {
    return this.rolService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar un rol por ID (solo administrador)' })
  @ApiParam({ name: 'id', type: Number, example: 2 })
  @ApiOkResponse({ description: 'Rol encontrado.' })
  @ApiNotFoundResponse({ description: 'Rol no encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un rol (solo administrador)' })
  @ApiParam({ name: 'id', type: Number, example: 2 })
  @ApiOkResponse({ description: 'Rol actualizado exitosamente.' })
  @ApiBadRequestResponse({ description: 'Los datos enviados no son válidos.' })
  @ApiConflictResponse({ description: 'Ya existe un rol con ese nombre.' })
  @ApiNotFoundResponse({ description: 'Rol no encontrado.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRolDto: UpdateRolDto,
  ) {
    return this.rolService.update(id, updateRolDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un rol (solo administrador)' })
  @ApiParam({ name: 'id', type: Number, example: 2 })
  @ApiOkResponse({ description: 'Rol eliminado exitosamente.' })
  @ApiForbiddenResponse({ description: 'El rol administrador (ID 1) no se puede eliminar.' })
  @ApiNotFoundResponse({ description: 'Rol no encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolService.remove(id);
  }
}
