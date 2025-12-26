# 🏛️ Ticketera Backend - API NestJS

Backend API para el sistema de ticketera del museo, desarrollado con NestJS y TypeScript.

## 🛠️ Tecnologías

- **Framework**: NestJS con TypeScript
- **Base de datos**: PostgreSQL con TypeORM
- **Autenticación**: JWT + Passport
- **Validación**: class-validator
- **ORM**: TypeORM
- **Configuración**: @nestjs/config

## 📁 Estructura del proyecto

```
src/
├── config/           # Configuraciones de base de datos y JWT
├── modules/          # Módulos de la aplicación
│   ├── auth/        # Autenticación y autorización
│   ├── users/       # Gestión de usuarios
│   ├── tickets/     # Gestión de tickets
│   ├── events/      # Gestión de eventos/exposiciones
│   └── payments/    # Integración con MercadoPago
├── entities/         # Entidades de base de datos
├── dto/             # Data Transfer Objects
├── guards/          # Guards de autenticación
├── decorators/      # Decoradores personalizados
└── interfaces/      # Interfaces TypeScript
```

## 🚀 Instalación y configuración

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:
- **Base de datos**: Configura las credenciales de Supabase
- **JWT**: Configura la clave secreta
- **MercadoPago**: Token de acceso (para más adelante)

### 3. Ejecutar la aplicación

```bash
# Desarrollo con hot-reload
npm run start:dev

# Producción
npm run start:prod

# Build
npm run build
```

La API estará disponible en: `http://localhost:3001`

## 🧪 Tests

```bash
# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Cobertura de tests
npm run test:cov
```

## 📋 API Endpoints

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar usuario
- `POST /auth/refresh` - Refrescar token

### Usuarios
- `GET /users/profile` - Obtener perfil de usuario
- `PUT /users/profile` - Actualizar perfil

### Tickets
- `GET /tickets` - Listar tickets del usuario
- `GET /tickets/:id` - Obtener ticket específico
- `POST /tickets` - Comprar ticket
- `DELETE /tickets/:id` - Cancelar ticket

### Eventos
- `GET /events` - Listar eventos disponibles
- `GET /events/:id` - Detalles de evento

### Pagos (Próximamente)
- `POST /payments/create` - Crear preferencia de pago
- `POST /payments/webhook` - Webhook de MercadoPago

## 🔧 Configuración de Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ve a Settings > API para obtener URL y keys
3. Configura las variables de entorno en `.env`
4. Ejecuta las migraciones de base de datos

## 🚀 Deployment

Para producción, recomendamos:
- **Railway**: Fácil deployment con PostgreSQL integrado
- **Heroku**: Plataforma cloud tradicional
- **Vercel**: Para serverless (requiere adaptación)

## 📚 Documentación adicional

- [Documentación NestJS](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Supabase Docs](https://supabase.com/docs)
- [MercadoPago API](https://www.mercadopago.com.ar/developers/es)
