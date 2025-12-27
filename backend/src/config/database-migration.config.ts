import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

// Función para obtener la configuración de la base de datos
function getDatabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const dbPassword = process.env.DATABASE_PASSWORD;

  if (!supabaseUrl || !dbPassword) {
    throw new Error('SUPABASE_URL y DATABASE_PASSWORD deben estar definidos en .env');
  }

  // Extraer el project ref de la URL de Supabase
  const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
  
  // IMPORTANTE: Usar el Pooler de Supabase (soporta IPv4)
  // La conexión directa (db.xxx.supabase.co) solo funciona con IPv6
  const host = 'aws-0-sa-east-1.pooler.supabase.com';
  const username = `postgres.${projectRef}`;

  console.log(`🔌 Migraciones - Conectando a Supabase Pooler: ${host}:6543`);

  return {
    type: 'postgres' as const,
    host: host,
    port: 6543,
    username: username,
    password: dbPassword,
    database: 'postgres',
    ssl: {
      rejectUnauthorized: false,
    },
    extra: {
      prepared_statements: false,
    },
  };
}

export const AppDataSource = new DataSource({
  ...getDatabaseConfig(),
  entities: ['src/entities/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
});

