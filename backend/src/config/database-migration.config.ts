import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

// Función para obtener la configuración de la base de datos
function getDatabaseConfig() {
  // Intentar usar DATABASE_URL primero
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    try {
      const url = new URL(databaseUrl);
      return {
        type: 'postgres' as const,
        host: url.hostname,
        port: parseInt(url.port) || 5432,
        username: url.username || 'postgres',
        password: url.password,
        database: url.pathname.slice(1) || 'postgres',
        ssl: {
          rejectUnauthorized: false,
        },
      };
    } catch (error) {
      console.warn('Error parsing DATABASE_URL, using individual config');
    }
  }

  // Si no hay DATABASE_URL, construir desde SUPABASE_URL
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('DATABASE_URL or SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined');
  }

  // Extraer el project ref de la URL de Supabase
  const supabaseHost = new URL(supabaseUrl).hostname;
  const projectRef = supabaseHost.replace('.supabase.co', '');
  const dbHost = `db.${projectRef}.supabase.co`;

  return {
    type: 'postgres' as const,
    host: dbHost,
    port: 5432,
    username: 'postgres',
    password: serviceRoleKey,
    database: 'postgres',
    ssl: {
      rejectUnauthorized: false,
    },
  };
}

export const AppDataSource = new DataSource({
  ...getDatabaseConfig(),
  entities: ['src/entities/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
});

