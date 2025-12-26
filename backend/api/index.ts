// Polyfill for Node.js 18 crypto global
import { webcrypto } from 'node:crypto';
if (!globalThis.crypto) {
    (globalThis as any).crypto = webcrypto;
}

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import express from 'express';
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';

const server = express();

let cachedApp: any = null;

async function bootstrap() {
    if (!cachedApp) {
        const app = await NestFactory.create(
            AppModule,
            new ExpressAdapter(server),
        );

        // Habilitar CORS para el frontend
        app.enableCors({
            origin: process.env.FRONTEND_URL || 'https://ticketera-two.vercel.app',
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        });

        // Validación automática de DTOs
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                transform: true,
            }),
        );

        await app.init();
        cachedApp = app;
    }
    return cachedApp;
}

export default async function handler(req: ExpressRequest, res: ExpressResponse) {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'https://ticketera-two.vercel.app');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.status(200).end();
        return;
    }

    await bootstrap();
    server(req, res);
}
