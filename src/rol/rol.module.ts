import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolService } from './rol.service';
import { RolController } from './rol.controller';
import { RolEntity } from './entities/rol.entity';
import { AuthorizationModule } from '../auth/authorization/authorization.module';

@Module({
  imports: [TypeOrmModule.forFeature([RolEntity]), AuthorizationModule],
  providers: [RolService],
  controllers: [RolController],
  exports: [RolService],
})
export class RolModule {}
