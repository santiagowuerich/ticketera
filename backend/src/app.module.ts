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
        // Opción 1: Usar DATABASE_URL si está disponible (formato completo de conexión)
        const databaseUrl = configService.get<string>('DATABASE_URL');
        
        if (databaseUrl && databaseUrl.startsWith('postgresql://')) {
          try {
            const url = new URL(databaseUrl);
            return {
              type: 'postgres',
              host: url.hostname,
              port: parseInt(url.port) || 5432,
              username: url.username || 'postgres',
              password: url.password || configService.get<string>('SUPABASE_SERVICE_ROLE_KEY'),
              database: url.pathname.slice(1) || 'postgres',
              entities: [User, Event, Ticket, Payment],
              synchronize: false,
              ssl: {
                rejectUnauthorized: false,
              },
            };
          } catch (error) {
            console.warn('Error parsing DATABASE_URL, using SUPABASE_URL fallback');
          }
        }
        
        // Opción 2: Usar SUPABASE_DB_HOST si está disponible
        const dbHost = configService.get<string>('SUPABASE_DB_HOST');
        if (dbHost) {
          return {
            type: 'postgres',
            host: dbHost,
            port: 5432,
            username: 'postgres',
            password: configService.get<string>('SUPABASE_SERVICE_ROLE_KEY'),
            database: 'postgres',
            entities: [User, Event, Ticket, Payment],
            synchronize: false,
            ssl: {
              rejectUnauthorized: false,
            },
          };
        }
        
        // Opción 3: Construir desde SUPABASE_URL
        const supabaseUrl = configService.get<string>('SUPABASE_URL');
        if (!supabaseUrl) {
          throw new Error('DATABASE_URL, SUPABASE_DB_HOST, or SUPABASE_URL must be defined');
        }
        
        try {
          const url = new URL(supabaseUrl);
          // Para Supabase, el host de la DB es: db.[project-ref].supabase.co
          // La URL de la API es: https://[project-ref].supabase.co
          const hostname = url.hostname;
          let dbHostname: string;
          
          if (hostname.includes('supabase.co')) {
            // Extraer el project-ref (primera parte del hostname)
            const projectRef = hostname.split('.')[0];
            dbHostname = `db.${projectRef}.supabase.co`;
          } else {
            // Si no es Supabase, usar el hostname directamente
            dbHostname = hostname;
          }
          
          return {
            type: 'postgres',
            host: dbHostname,
            port: 5432,
            username: 'postgres',
            password: configService.get<string>('SUPABASE_SERVICE_ROLE_KEY'),
            database: 'postgres',
            entities: [User, Event, Ticket, Payment],
            synchronize: false,
            ssl: {
              rejectUnauthorized: false,
            },
          };
        } catch (error) {
          throw new Error(`Invalid SUPABASE_URL format: ${supabaseUrl}. Error: ${error}`);
        }
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
export class AppModule {}
