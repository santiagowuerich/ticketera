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
        // Intentar usar DATABASE_URL primero (connection string completa)
        const databaseUrl = configService.get<string>('DATABASE_URL');
        if (databaseUrl) {
          // Si DATABASE_URL está disponible, TypeORM puede parsearla automáticamente
          // pero necesitamos extraer los componentes
          try {
            const url = new URL(databaseUrl);
            return {
              type: 'postgres',
              host: url.hostname,
              port: parseInt(url.port) || 5432,
              username: url.username || 'postgres',
              password: url.password,
              database: url.pathname.slice(1) || 'postgres',
              entities: [User, Event, Ticket, Payment],
              synchronize: false,
              ssl: {
                rejectUnauthorized: false,
              },
            };
          } catch (error) {
            console.warn('Error parsing DATABASE_URL, using individual config');
          }
        }

        // Si no hay DATABASE_URL, construir desde SUPABASE_URL
        const supabaseUrl = configService.get<string>('SUPABASE_URL');
        const serviceRoleKey = configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
        
        if (!supabaseUrl || !serviceRoleKey) {
          throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined, or use DATABASE_URL');
        }

        // Extraer el project ref de la URL de Supabase
        // Ejemplo: https://xxxxx.supabase.co -> db.xxxxx.supabase.co
        const supabaseHost = new URL(supabaseUrl).hostname;
        const projectRef = supabaseHost.replace('.supabase.co', '');
        const dbHost = `db.${projectRef}.supabase.co`;
        
        return {
          type: 'postgres',
          host: dbHost,
          port: 5432,
          username: 'postgres',
          password: serviceRoleKey,
          database: 'postgres',
          entities: [User, Event, Ticket, Payment],
          synchronize: false,
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
export class AppModule {}
