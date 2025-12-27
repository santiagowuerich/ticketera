"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const events_module_1 = require("./events/events.module");
const tickets_module_1 = require("./tickets/tickets.module");
const payments_module_1 = require("./payments/payments.module");
const user_entity_1 = require("./entities/user.entity");
const event_entity_1 = require("./entities/event.entity");
const ticket_entity_1 = require("./entities/ticket.entity");
const payment_entity_1 = require("./entities/payment.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => {
                    const supabaseUrl = configService.get('SUPABASE_URL');
                    const dbPassword = configService.get('DATABASE_PASSWORD');
                    const nodeEnv = configService.get('NODE_ENV', 'development');
                    if (!supabaseUrl || !dbPassword) {
                        throw new Error('SUPABASE_URL y DATABASE_PASSWORD deben estar definidos en .env');
                    }
                    const projectRef = supabaseUrl
                        .replace('https://', '')
                        .replace('.supabase.co', '');
                    const host = `db.${projectRef}.supabase.co`;
                    console.log(`🔌 Conectando a Supabase: ${host}:5432`);
                    console.log(`   Proyecto: ${projectRef}`);
                    console.log(`   Entorno: ${nodeEnv}`);
                    return {
                        type: 'postgres',
                        host: host,
                        port: 5432,
                        username: 'postgres',
                        password: dbPassword,
                        database: 'postgres',
                        entities: [user_entity_1.User, event_entity_1.Event, ticket_entity_1.Ticket, payment_entity_1.Payment],
                        synchronize: nodeEnv !== 'production',
                        logging: nodeEnv === 'development',
                        ssl: {
                            rejectUnauthorized: false,
                        },
                    };
                },
                inject: [config_1.ConfigService],
            }),
            auth_module_1.AuthModule,
            events_module_1.EventsModule,
            tickets_module_1.TicketsModule,
            payments_module_1.PaymentsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map