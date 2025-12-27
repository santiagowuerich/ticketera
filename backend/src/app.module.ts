import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { TicketsModule } from './tickets/tickets.module';
import { PaymentsModule } from './payments/payments.module';
import { User } from './entities/user.entity';
import { Event } from './entities/event.entity';
import { Ticket } from './entities/ticket.entity';
import { Payment } from './entities/payment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const supabaseUrl = configService.get<string>('SUPABASE_URL');
        const dbPassword = configService.get<string>('DATABASE_PASSWORD');
        const nodeEnv = configService.get<string>('NODE_ENV', 'development');

        if (!supabaseUrl || !dbPassword) {
          throw new Error('SUPABASE_URL y DATABASE_PASSWORD deben estar definidos en .env');
        }

        // Extraer project ref de SUPABASE_URL
        // Ejemplo: https://kkbvemjgdpkcstrgorxc.supabase.co -> kkbvemjgdpkcstrgorxc
        const projectRef = supabaseUrl
          .replace('https://', '')
          .replace('.supabase.co', '');

        // En PRODUCCIÓN: Usar el Supabase Pooler (funciona desde Vercel)
        // En DESARROLLO: Usar conexión directa (funciona localmente)
        const isProduction = nodeEnv === 'production';

        if (isProduction) {
          // Pooler de Supabase - probamos múltiples regiones comunes
          // El usuario debe verificar su región en Supabase Dashboard -> Settings -> Database -> Connection string
          const poolerHost = 'aws-0-us-east-1.pooler.supabase.com';
          const poolerUsername = `postgres.${projectRef}`;

          console.log(`🚀 PRODUCCIÓN: Conectando via Supabase Pooler`);
          console.log(`   Host: ${poolerHost}:6543`);
          console.log(`   Usuario: ${poolerUsername}`);
          console.log(`   Proyecto: ${projectRef}`);

          return {
            type: 'postgres' as const,
            host: poolerHost,
            port: 6543,
            username: poolerUsername,
            password: dbPassword,
            database: 'postgres',
            entities: [User, Event, Ticket, Payment],
            synchronize: false,
            logging: false,
            ssl: {
              rejectUnauthorized: false,
            },
          };
        }

        // Desarrollo: conexión directa
        const host = `db.${projectRef}.supabase.co`;
        console.log(`🔌 DESARROLLO: Conectando directamente a Supabase`);
        console.log(`   Host: ${host}:5432`);
        console.log(`   Proyecto: ${projectRef}`);

        return {
          type: 'postgres' as const,
          host: host,
          port: 5432,
          username: 'postgres',
          password: dbPassword,
          database: 'postgres',
          entities: [User, Event, Ticket, Payment],
          synchronize: true,
          logging: true,
          ssl: {
            rejectUnauthorized: false,
          },
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    EventsModule,
    TicketsModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
