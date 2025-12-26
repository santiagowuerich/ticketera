import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: new URL(configService.get('SUPABASE_URL')!).host,
  port: 5432,
  username: 'postgres',
  password: configService.get('SUPABASE_SERVICE_ROLE_KEY'),
  database: 'postgres',
  entities: ['src/entities/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
  ssl: {
    rejectUnauthorized: false,
  },
});
