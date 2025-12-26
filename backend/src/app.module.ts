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
        const databaseUrl = configService.get<string>('DATABASE_URL')?.trim();
        if (databaseUrl) {
          try {
            const url = new URL(databaseUrl);
            const database = url.pathname.slice(1) || 'postgres'; // Remover el "/" inicial
            
            const config = {
              type: 'postgres' as const,
              host: url.hostname,
              port: parseInt(url.port) || 5432,
              username: url.username || 'postgres',
              password: url.password,
              database: database,
              entities: [User, Event, Ticket, Payment],
              synchronize: false,
              ssl: {
                rejectUnauthorized: false,
              },
              extra: {
                connectionTimeoutMillis: 10000, // 10 segundos
                max: 10, // máximo de conexiones en el pool
              },
              retryAttempts: 3,
              retryDelay: 3000,
            };
            
            console.log(`✅ Conectando a Supabase usando DATABASE_URL`);
            console.log(`   Host: ${config.host}:${config.port}`);
            console.log(`   Database: ${config.database}`);
            
            return config;
          } catch (error) {
            console.warn('❌ Error parsing DATABASE_URL:', error);
            console.warn('   Intentando usar configuración individual...');
          }
        }

        // Si no hay DATABASE_URL, construir desde SUPABASE_URL
        const supabaseUrl = configService.get<string>('SUPABASE_URL');
        const serviceRoleKey = configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
        
        if (!supabaseUrl || !serviceRoleKey) {
          throw new Error('DATABASE_URL o (SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY) deben estar definidos');
        }

        // Extraer el project ref de la URL de Supabase
        // Ejemplo: https://xxxxx.supabase.co -> db.xxxxx.supabase.co
        const supabaseHost = new URL(supabaseUrl).hostname;
        const projectRef = supabaseHost.replace('.supabase.co', '');
        const dbHost = `db.${projectRef}.supabase.co`;
        
        const config = {
          type: 'postgres' as const,
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
          extra: {
            connectionTimeoutMillis: 10000, // 10 segundos
            max: 10, // máximo de conexiones en el pool
          },
          retryAttempts: 3,
          retryDelay: 3000,
        };
        
        console.log(`✅ Conectando a Supabase usando SUPABASE_URL`);
        console.log(`   Host: ${config.host}:${config.port}`);
        
        return config;
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
