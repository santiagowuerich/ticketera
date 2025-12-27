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

        // Host de la base de datos (conexión directa)
        const host = `db.${projectRef}.supabase.co`;

        console.log(`🔌 Conectando a Supabase: ${host}:5432`);
        console.log(`   Proyecto: ${projectRef}`);
        console.log(`   Entorno: ${nodeEnv}`);

        return {
          type: 'postgres' as const,
          host: host,
          port: 5432,
          username: 'postgres',
          password: dbPassword,
          database: 'postgres',
          entities: [User, Event, Ticket, Payment],
          synchronize: nodeEnv !== 'production',
          logging: nodeEnv === 'development',
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
