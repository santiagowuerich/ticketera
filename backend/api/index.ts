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
        try {
            const app = await NestFactory.create(
                AppModule,
                new ExpressAdapter(server),
                {
                    logger: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['log', 'error', 'warn', 'debug'],
                }
            );

            // Habilitar CORS para el frontend
            const frontendUrl = process.env.FRONTEND_URL || 'https://ticketera-two.vercel.app';
            app.enableCors({
                origin: frontendUrl,
                credentials: true,
                methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
                allowedHeaders: ['Content-Type', 'Authorization'],
            });

            // Validación automática de DTOs
            app.useGlobalPipes(
                new ValidationPipe({
                    whitelist: true,
                    transform: true,
                    forbidNonWhitelisted: false,
                }),
            );

            await app.init();
            cachedApp = app;
        } catch (error) {
            console.error('Error initializing NestJS app:', error);
            throw error;
        }
    }
    return cachedApp;
}

export default async function handler(req: ExpressRequest, res: ExpressResponse) {
    // Handle preflight requests
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
    } catch (error) {
        console.error('Error handling request:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: process.env.NODE_ENV === 'development' ? (error as Error).message : 'An error occurred',
        });
    }
}
