import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const databaseUrl = configService.get<string>('DATABASE_URL');
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  if (databaseUrl) {
    console.log('🔌 Conectando a la base de datos mediante DATABASE_URL...');
    return {
      type: 'postgres',
      url: databaseUrl,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: false, // Nunca sincronizar en producción por seguridad
      logging: nodeEnv === 'development',
      ssl: databaseUrl.includes('localhost') ? false : {
        rejectUnauthorized: false,
      },
    };
  }

  // Fallback para desarrollo local o configuración manual
  const host = configService.get<string>('DATABASE_HOST', 'localhost');
  const port = parseInt(configService.get<string>('DATABASE_PORT', '5432'), 10);
  const username = configService.get<string>('DATABASE_USERNAME', 'postgres');
  const password = configService.get<string>('DATABASE_PASSWORD', 'postgres');
  const database = configService.get<string>('DATABASE_NAME', 'ticketera');

  console.log(`🔌 Conectando a la base de datos: ${host}:${port}/${database}`);

  return {
    type: 'postgres',
    host,
    port,
    username,
    password,
    database,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: nodeEnv !== 'production',
    logging: nodeEnv === 'development',
    ssl: nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
  };
};
