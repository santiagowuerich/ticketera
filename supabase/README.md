# 🗄️ Configuración de Supabase

Guía para configurar la base de datos Supabase para el proyecto Ticketera.

## 🚀 Configuración Inicial

### 1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Espera a que se complete la configuración inicial

### 2. Configurar variables de entorno

Una vez creado el proyecto, ve a **Settings > API** y copia:

- **Project URL**
- **anon/public key**
- **service_role key** (mantén esto privado)

Actualiza tu archivo `.env` en la carpeta backend:

```env
SUPABASE_URL=tu-project-url
SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

## 📊 Esquema de Base de Datos

### Tablas Principales

#### `users`
- Información de usuarios registrados
- Roles: `user` (default) y `admin`
- Autenticación con JWT

#### `events`
- Eventos/exposiciones del museo
- Información de precios y capacidad
- Control de tickets disponibles

#### `tickets`
- Tickets comprados por usuarios
- Estado: `active`, `used`, `cancelled`, `refunded`
- QR codes únicos para validación

#### `payments`
- Integración con MercadoPago
- Estados de pago y transacciones

## 🔒 Seguridad (RLS - Row Level Security)

Todas las tablas tienen políticas RLS configuradas:

- **Usuarios**: Solo pueden ver/editar su propio perfil
- **Eventos**: Lectura pública para eventos activos, solo admins pueden modificar
- **Tickets**: Usuarios ven solo sus tickets, admins ven todos
- **Pagos**: Vinculados a tickets del usuario

## 🏃‍♂️ Ejecutar Migraciones

### Opción 1: SQL Editor de Supabase

1. Ve al **SQL Editor** en tu proyecto Supabase
2. Copia y pega el contenido de cada archivo de migración:
   - `migrations/001_initial_schema.sql`
   - `migrations/002_rls_policies.sql`
3. Ejecuta las consultas en orden

### Opción 2: Supabase CLI (Recomendado)

```bash
# Instalar Supabase CLI
npm install -g supabase

# Iniciar sesión
supabase login

# Vincular proyecto
supabase link --project-ref tu-project-ref

# Ejecutar migraciones
supabase db push
```

## 🌱 Poblar con Datos de Ejemplo

Para desarrollo, ejecuta el archivo de seed:

```sql
-- En SQL Editor de Supabase
-- Ejecuta el contenido de: seed/sample_data.sql
```

Esto creará:
- 1 usuario administrador (`admin@museo.com`)
- 1 usuario normal (`usuario@museo.com`)
- 5 eventos de ejemplo
- Algunos tickets de prueba

**Contraseña para usuarios de ejemplo:** `password123`

## 🔧 Comandos Útiles

### Ver estado de la base de datos
```bash
supabase db diff
```

### Resetear base de datos
```bash
supabase db reset
```

### Generar tipos TypeScript
```bash
supabase gen types typescript --local > types/supabase.ts
```

## 📋 Próximos Pasos

Después de configurar Supabase:

1. **Backend**: Conectar NestJS con Supabase
2. **Entidades**: Crear modelos TypeORM
3. **Autenticación**: Implementar sistema de login/registro
4. **API**: Crear endpoints para gestión de tickets
5. **Frontend**: Conectar Next.js con la API

## 🆘 Solución de Problemas

### Error de conexión
- Verifica las variables de entorno
- Asegúrate de que el proyecto Supabase esté activo

### Políticas RLS bloqueando queries
- Verifica que las políticas estén correctamente configuradas
- Usa el service_role key para operaciones administrativas

### Migraciones fallidas
- Ejecuta las migraciones en orden
- Verifica que no existan tablas con nombres similares

## 📚 Recursos Adicionales

- [Documentación Supabase](https://supabase.com/docs)
- [Guía de RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI](https://supabase.com/docs/reference/cli)
