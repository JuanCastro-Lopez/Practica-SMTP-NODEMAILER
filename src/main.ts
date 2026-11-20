import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { CategoriasModule } from './categorias/categorias.module';
import { ProductosModule } from './productos/productos.module';
import { RolModule } from './rol/rol.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validación global de DTOs con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades que no estén en el DTO
      forbidNonWhitelisted: true, // Lanza error si envían propiedades no permitidas
      transform: true, // Transforma automáticamente los tipos primitivos del payload
    }),
  );

  // Prefijo global para las rutas de la API
  app.setGlobalPrefix('api');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Tienda API')
    .setDescription(
      'API de la tienda. Las rutas de escritura del catálogo y la gestión de roles requieren JWT de administrador (rol ID 1). El registro público asigna el rol cliente (ID 2).',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'bearer',
    )
    .addTag('Auth', 'Operaciones de autenticación')
    .addTag('Usuarios', 'Operaciones de usuarios')
    .addTag('Categorías', 'Consulta pública y administración del catálogo')
    .addTag('Productos', 'Consulta pública y administración del catálogo')
    .addTag('Roles', 'Gestión exclusiva para administradores')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig, {
    include: [
      AuthModule,
      UsuariosModule,
      CategoriasModule,
      ProductosModule,
      RolModule,
    ],
  });
  SwaggerModule.setup('api/docs', app, swaggerDocument);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  await app.listen(port);
  console.log(`🚀 Servidor ejecutándose en http://localhost:${port}/api`);
}
bootstrap();
