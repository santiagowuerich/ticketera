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
        // Forzar uso de IPv4 para evitar problemas con IPv6
        dns.setDefaultResultOrder('ipv4first');
        
        // Intentar usar DATABASE_URL primero (connection string completa)
        const databaseUrl = configService.get<string>('DATABASE_URL')?.trim();
        if (databaseUrl) {
          try {
            const url = new URL(databaseUrl);
            const database = url.pathname.slice(1) || 'postgres'; // Remover el "/" inicial
            
            // Resolver hostname a IPv4 para evitar problemas con IPv6
            let host = url.hostname;
            try {
              const address = await new Promise<string>((resolve, reject) => {
                dns.lookup(url.hostname, { family: 4, all: false }, (err, address) => {
                  if (err) reject(err);
                  else resolve(address);
                });
              });
              if (address) {
                host = address;
                console.log(`   Resuelto a IPv4: ${host}`);
              }
            } catch (dnsError: any) {
              if (dnsError.code === 'ENOTFOUND' || dnsError.code === 'ENODATA') {
                // Si no hay IPv4, resolver el pooler a IPv4
                console.warn(`   No hay IPv4 disponible para ${url.hostname}`);
                console.warn(`   Resolviendo pooler de Supabase a IPv4...`);
                try {
                  const poolerAddress = await new Promise<string>((resolve, reject) => {
                    dns.lookup('aws-0-us-east-1.pooler.supabase.com', { family: 4, all: false }, (err, address) => {
                      if (err) reject(err);
                      else resolve(address);
                    });
                  });
                  host = poolerAddress;
                  console.log(`   ✅ Usando pooler IPv4: ${host}`);
                } catch (poolerError) {
                  console.warn(`   Error resolviendo pooler, usando hostname original: ${host}`);
                }
              } else {
                console.warn(`   Error resolviendo DNS, usando hostname: ${host}`);
              }
            }
            
            const config = {
              type: 'postgres' as const,
              host: host,
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
                connectionTimeoutMillis: 15000, // 15 segundos
                max: 10, // máximo de conexiones en el pool
              },
              // Configuración adicional para el driver de pg
              options: `-c statement_timeout=30000`,
              retryAttempts: 5,
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
        
        // Resolver hostname a IPv4
        let resolvedHost = dbHost;
        try {
          const address = await new Promise<string>((resolve, reject) => {
            dns.lookup(dbHost, { family: 4, all: false }, (err, address) => {
              if (err) reject(err);
              else resolve(address);
            });
          });
          if (address) {
            resolvedHost = address;
            console.log(`   Resuelto a IPv4: ${resolvedHost}`);
          }
        } catch (dnsError: any) {
          if (dnsError.code === 'ENOTFOUND' || dnsError.code === 'ENODATA') {
            // Si no hay IPv4, resolver el pooler a IPv4
            console.warn(`   No hay IPv4 disponible para ${dbHost}`);
            console.warn(`   Resolviendo pooler de Supabase a IPv4...`);
            try {
              const poolerAddress = await new Promise<string>((resolve, reject) => {
                dns.lookup('aws-0-us-east-1.pooler.supabase.com', { family: 4, all: false }, (err, address) => {
                  if (err) reject(err);
                  else resolve(address);
                });
              });
              resolvedHost = poolerAddress;
              console.log(`   ✅ Usando pooler IPv4: ${resolvedHost}`);
            } catch (poolerError) {
              console.warn(`   Error resolviendo pooler, usando hostname original: ${resolvedHost}`);
            }
          } else {
            console.warn(`   Error resolviendo DNS, usando hostname: ${resolvedHost}`);
          }
        }
        
        const config = {
          type: 'postgres' as const,
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
          extra: {
            connectionTimeoutMillis: 15000, // 15 segundos
            max: 10, // máximo de conexiones en el pool
          },
          // Configuración adicional para el driver de pg
          options: `-c statement_timeout=30000`,
          retryAttempts: 5,
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
