"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const dns = __importStar(require("node:dns"));
dns.setDefaultResultOrder('ipv4first');
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
                logger: process.env.NODE_ENV === 'production'
                    ? ['error', 'warn']
                    : ['log', 'error', 'warn', 'debug'],
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
            console.log('✅ NestJS app initialized successfully');
        }
        catch (error) {
            console.error('❌ Error initializing NestJS app:', error);
            throw error;
        }
    }
    return cachedApp;
}
async function handler(req, res) {
    const frontendUrl = process.env.FRONTEND_URL || 'https://ticketera-two.vercel.app';
    res.setHeader('Access-Control-Allow-Origin', frontendUrl);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    try {
        await bootstrap();
        server(req, res);
    }
    catch (error) {
        console.error('❌ Error handling request:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: process.env.NODE_ENV === 'development'
                ? error.message
                : 'An error occurred',
        });
    }
}
//# sourceMappingURL=index.js.map