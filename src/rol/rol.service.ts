import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { RolEntity } from './entities/rol.entity';

@Injectable()
export class RolService {
  constructor(
    @InjectRepository(RolEntity)
    private readonly rolRepository: Repository<RolEntity>,
  ) {}

  async create(createRolDto: CreateRolDto) {
    const existingRole = await this.rolRepository
      .createQueryBuilder('rol')
      .where('rol.nombre = :nombre', { nombre: createRolDto.nombre })
      .getOne();

    if (existingRole) {
      throw new ConflictException(
        `El rol con el nombre "${createRolDto.nombre}" ya existe`,
      );
    }

    const role = this.rolRepository.create(createRolDto);
    const savedRole = await this.rolRepository.save(role);

    return {
      message: 'Rol creado exitosamente',
      data: savedRole,
    };
  }

  async findAll(): Promise<RolEntity[]> {
    return this.rolRepository
      .createQueryBuilder('rol')
      .orderBy('rol.id', 'ASC')
      .getMany();
  }

  async findOne(id: number): Promise<RolEntity> {
    const role = await this.rolRepository
      .createQueryBuilder('rol')
      .where('rol.id = :id', { id })
      .getOne();

    if (!role) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    return role;
  }

  async update(id: number, updateRolDto: UpdateRolDto) {
    const role = await this.findOne(id);

    if (updateRolDto.nombre && updateRolDto.nombre !== role.nombre) {
      const existingRole = await this.rolRepository
        .createQueryBuilder('rol')
        .where('rol.nombre = :nombre', { nombre: updateRolDto.nombre })
        .andWhere('rol.id != :id', { id })
        .getOne();

      if (existingRole) {
        throw new ConflictException(
          `El rol con el nombre "${updateRolDto.nombre}" ya existe`,
        );
      }
    }

    this.rolRepository.merge(role, updateRolDto);
    const savedRole = await this.rolRepository.save(role);

    return {
      message: 'Rol actualizado exitosamente',
      data: savedRole,
    };
  }

  async remove(id: number): Promise<{ message: string }> {
    const role = await this.findOne(id);
    await this.rolRepository.remove(role);

    return {
      message: `Rol "${role.nombre}" con ID ${id} eliminado exitosamente`,
    };
  }
}
