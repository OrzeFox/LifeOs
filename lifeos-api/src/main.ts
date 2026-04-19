import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';

// Asegura que exista la carpeta de logs
const LOG_DIR = path.join(process.cwd(), 'logs');
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);

const LOG_FILE = path.join(LOG_DIR, 'api.log');
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });

// Intercepta stdout/stderr y duplica al archivo
const originalWrite = process.stdout.write.bind(process.stdout);
process.stdout.write = (chunk: any, ...args: any[]) => {
  logStream.write(chunk);
  return originalWrite(chunk, ...args);
};
const originalErrWrite = process.stderr.write.bind(process.stderr);
process.stderr.write = (chunk: any, ...args: any[]) => {
  logStream.write(chunk);
  return originalErrWrite(chunk, ...args);
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api');
  const allowedOrigins = [
    'http://localhost:5173',
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []),
  ];
  app.enableCors({ origin: allowedOrigins });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(process.env.PORT ?? 3000);
  logger.log(`Logs guardados en: ${LOG_FILE}`);
}
bootstrap();
