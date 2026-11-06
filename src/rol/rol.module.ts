import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolService } from './rol.service';
import { RolController } from './rol.controller';
import { RolEntity } from './entities/rol.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RolEntity])],
  providers: [RolService],
  controllers: [RolController],
  exports: [RolService],
})
export class RolModule {}
