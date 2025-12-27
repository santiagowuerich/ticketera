"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
function getDatabaseConfig() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const dbPassword = process.env.DATABASE_PASSWORD;
    if (!supabaseUrl || !dbPassword) {
        throw new Error('SUPABASE_URL y DATABASE_PASSWORD deben estar definidos en .env');
    }
    const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
    const host = 'aws-0-sa-east-1.pooler.supabase.com';
    const username = `postgres.${projectRef}`;
    console.log(`🔌 Migraciones - Conectando a Supabase Pooler: ${host}:6543`);
    return {
        type: 'postgres',
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
exports.AppDataSource = new typeorm_1.DataSource({
    ...getDatabaseConfig(),
    entities: ['src/entities/*.entity{.ts,.js}'],
    migrations: ['src/migrations/*{.ts,.js}'],
});
//# sourceMappingURL=database-migration.config.js.map