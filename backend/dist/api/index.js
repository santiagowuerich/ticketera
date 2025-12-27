"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const node_crypto_1 = require("node:crypto");
if (!globalThis.crypto) {
    globalThis.crypto = node_crypto_1.webcrypto;
}
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const app_module_1 = require("../src/app.module");
const express_1 = __importDefault(require("express"));
const server = (0, express_1.default)();
let cachedApp = null;
async function bootstrap() {
    if (!cachedApp) {
        try {
            const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(server), {
                logger: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['log', 'error', 'warn', 'debug'],
            });
            const frontendUrl = process.env.FRONTEND_URL || 'https://ticketera-two.vercel.app';
            app.enableCors({
                origin: frontendUrl,
                credentials: true,
                methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
                allowedHeaders: ['Content-Type', 'Authorization'],
            });
            app.useGlobalPipes(new common_1.ValidationPipe({
                whitelist: true,
                transform: true,
                forbidNonWhitelisted: false,
            }));
            await app.init();
            cachedApp = app;
        }
        catch (error) {
            console.error('Error initializing NestJS app:', error);
            throw error;
        }
    }
    return cachedApp;
}
async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        const frontendUrl = process.env.FRONTEND_URL || 'https://ticketera-two.vercel.app';
        res.setHeader('Access-Control-Allow-Origin', frontendUrl);
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.status(200).end();
        return;
    }
    try {
        await bootstrap();
        server(req, res);
    }
    catch (error) {
        console.error('Error handling request:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred',
        });
    }
}
//# sourceMappingURL=index.js.map