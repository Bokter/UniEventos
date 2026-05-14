import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ValidationPipe global — valida automáticamente todos los DTOs con class-validator
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,        // Elimina propiedades que no estén en el DTO
    forbidNonWhitelisted: true, // Lanza error si envían propiedades desconocidas
    transform: true,        // Transforma payloads a instancias del DTO
  }));

  // Aumentar el límite de tamaño de las peticiones JSON para permitir imágenes base64 grandes
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Habilitar CORS para el frontend
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://uni-eventos-rho.vercel.app',
      'https://unieventos-s25a.onrender.com',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('UniEventos API')
    .setDescription('API del sistema de eventos universitarios')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000, '0.0.0.0');
}
bootstrap();