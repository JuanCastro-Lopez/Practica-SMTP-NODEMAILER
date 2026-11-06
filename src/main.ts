import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';

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
    .setDescription('Documentación de los módulos de autenticación y usuarios')
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
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig, {
    include: [AuthModule, UsuariosModule],
  });
  SwaggerModule.setup('api/docs', app, swaggerDocument);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  await app.listen(port);
  console.log(`🚀 Servidor ejecutándose en http://localhost:${port}/api`);
}
bootstrap();
