# Configuración del Backend en Vercel

## Variables de Entorno Requeridas

Asegúrate de configurar las siguientes variables de entorno en el dashboard de Vercel:

### Base de Datos (Supabase)
- `SUPABASE_URL`: URL de tu proyecto Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Clave de servicio de Supabase

### Autenticación
- `JWT_SECRET`: Clave secreta para firmar los tokens JWT

### Frontend
- `FRONTEND_URL`: URL del frontend (ej: `https://ticketera-two.vercel.app`)

### Otros (opcionales)
- `NODE_ENV`: `production` (se establece automáticamente en Vercel)
- `PORT`: No es necesario en Vercel (se maneja automáticamente)

## Configuración en Vercel

1. Ve a tu proyecto en Vercel
2. Navega a **Settings** > **Environment Variables**
3. Agrega todas las variables de entorno mencionadas arriba
4. Asegúrate de que estén configuradas para el entorno de **Production** (y **Preview** si es necesario)

## Estructura del Proyecto

El proyecto está configurado para funcionar con Vercel usando:
- `api/index.ts`: Handler serverless para Vercel
- `vercel.json`: Configuración de Vercel
- NestJS compilado con TypeScript usando `@vercel/node`

## Notas Importantes

- El handler en `api/index.ts` cachea la aplicación NestJS para mejorar el rendimiento
- CORS está configurado para permitir requests desde el frontend
- La validación de DTOs está habilitada globalmente
- Las conexiones a la base de datos se manejan automáticamente por TypeORM

## Solución de Problemas

Si encuentras errores al desplegar:

1. Verifica que todas las variables de entorno estén configuradas
2. Revisa los logs de Vercel en el dashboard
3. Asegúrate de que `SUPABASE_URL` tenga el formato correcto (debe ser una URL válida)
4. Verifica que las entidades estén correctamente importadas en `app.module.ts`

