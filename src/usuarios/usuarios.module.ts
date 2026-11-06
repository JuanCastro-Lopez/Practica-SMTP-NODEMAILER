import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { UsuarioEntity } from './entities/usuario.entity';
import { RolModule } from 'src/rol/rol.module';

@Module({
  imports: [TypeOrmModule.forFeature([UsuarioEntity]), RolModule],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService]
})
export class UsuariosModule {}
