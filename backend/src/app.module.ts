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
import * as dns from 'dns';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const supabaseUrl = configService.get<string>('SUPABASE_URL');
        const serviceRoleKey = configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
        
        if (!supabaseUrl || !serviceRoleKey) {
          throw new Error('SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar definidos');
        }

        // Extraer el project ref de la URL de Supabase
        // Ejemplo: https://xxxxx.supabase.co -> db.xxxxx.supabase.co
        const supabaseHost = new URL(supabaseUrl).hostname;
        const projectRef = supabaseHost.replace('.supabase.co', '');
        const dbHost = `db.${projectRef}.supabase.co`;
        
        // Resolver hostname a IPv4 para evitar problemas con IPv6
        let resolvedHost = dbHost;
        try {
          // Forzar IPv4 primero
          dns.setDefaultResultOrder('ipv4first');
          const address = await new Promise<string>((resolve, reject) => {
            dns.lookup(dbHost, { family: 4, all: false }, (err, address) => {
              if (err) reject(err);
              else resolve(address);
            });
          });
          if (address) {
            resolvedHost = address;
            console.log(`✅ Resuelto ${dbHost} a IPv4: ${resolvedHost}`);
          }
        } catch (dnsError: any) {
          // Si no hay IPv4, usar el pooler de Supabase que sí tiene IPv4
          if (dnsError.code === 'ENOTFOUND' || dnsError.code === 'ENODATA') {
            console.warn(`⚠️  No hay IPv4 para ${dbHost}, usando pooler de Supabase`);
            const poolerHost = `${projectRef}.pooler.supabase.com`;
            try {
              const poolerAddress = await new Promise<string>((resolve, reject) => {
                dns.lookup(poolerHost, { family: 4, all: false }, (err, address) => {
                  if (err) reject(err);
                  else resolve(address);
                });
              });
              resolvedHost = poolerAddress;
              console.log(`✅ Usando pooler IPv4: ${resolvedHost}`);
            } catch (poolerError) {
              console.warn(`⚠️  Error con pooler, usando hostname original: ${dbHost}`);
              resolvedHost = dbHost;
            }
          } else {
            console.warn(`⚠️  Error DNS, usando hostname original: ${dbHost}`);
          }
        }
        
        return {
          type: 'postgres',
          host: resolvedHost,
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
