import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const supabaseUrl = configService.get('SUPABASE_URL');

  // Parse Supabase URL to extract connection details
  // Supabase connection string format: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
  const databaseUrl = configService.get('DATABASE_URL');

  if (databaseUrl) {
    // Use DATABASE_URL if provided (Supabase connection string)
    return {
      type: 'postgres',
      url: databaseUrl,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: configService.get('NODE_ENV') !== 'production', // Disable in production
      logging: false,
      ssl: {
        rejectUnauthorized: false, // Required for Supabase
      },
    };
  }

  // Option 2: Construct from SUPABASE_URL + DATABASE_PASSWORD
  const dbPassword = configService.get('DATABASE_PASSWORD');

  if (supabaseUrl && dbPassword) {
    // Extract project ref from: https://kkbvemjgdpkcstrgorxc.supabase.co
    const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
    const host = `db.${projectRef}.supabase.co`;

    console.log(`🔌 Intentando conectar a Supabase: ${host} (Puerto 6543)`);

    return {
      type: 'postgres',
      host: host,
      port: 6543, // Usar el puerto del pooler (más confiable)
      username: 'postgres',
      password: dbPassword,
      database: 'postgres',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: configService.get('NODE_ENV') !== 'production',
      logging: false,
      ssl: {
        rejectUnauthorized: false,
      },
    };
  }

  // Option 3: Individual connection params (local development fallback)
  return {
    type: 'postgres',
    host: configService.get('DATABASE_HOST') || 'localhost',
    port: parseInt(configService.get('DATABASE_PORT') || '5432'),
    username: configService.get('DATABASE_USERNAME') || 'postgres',
    password: configService.get('DATABASE_PASSWORD') || 'postgres',
    database: configService.get('DATABASE_NAME') || 'ticketera',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: configService.get('NODE_ENV') !== 'production',
    logging: configService.get('NODE_ENV') === 'development',
  };
};
