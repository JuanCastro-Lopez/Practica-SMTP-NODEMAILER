import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriasService } from './categorias.service';
import { CategoriasController } from './categorias.controller';
import { Categoria } from './entities/categoria.entity';
import { AuthorizationModule } from '../auth/authorization/authorization.module';

@Module({
  imports: [TypeOrmModule.forFeature([Categoria]), AuthorizationModule],
  controllers: [CategoriasController],
  providers: [CategoriasService],
  exports: [CategoriasService], // Se exporta para que ProductosModule lo pueda inyectar
})
export class CategoriasModule {}
