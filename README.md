# Ticketera Museo

Sistema de gestión de tickets para museo con integración de pagos.

## Arquitectura

- **Frontend**: React/Vite con TypeScript + shadcn/ui
- **Backend**: NestJS con TypeScript
- **Base de datos**: Supabase (PostgreSQL)
- **Pagos**: MercadoPago
- **Modelo**: **Compra anónima** (sin registro de usuarios)

## Estructura del proyecto

```
ticketera/
├── frontend/          # React/Vite + shadcn/ui + Tailwind CSS
├── backend/           # NestJS + TypeORM + Supabase
├── supabase/          # Esquemas y migraciones de BD
├── README.md         # Este archivo
└── NEXT_STEPS.md     # Guía de configuración
```

## Modelo de Negocio: Compra Anónima

### ✅ Ventajas del enfoque
- **Simplicidad**: Sin registro/login requerido
- **Conversión**: Menos fricción para visitantes ocasionales
- **Privacidad**: Mínimos datos personales almacenados
- **Velocidad**: Proceso de compra más rápido
- **Escalabilidad**: Ideal para museos con visitantes únicos

### 📋 Flujo de compra
1. **Selección**: Usuario elige evento y fecha/hora
2. **Datos**: Completa información básica (nombre, email, DNI)
3. **Pago**: MercadoPago procesa el pago
4. **Confirmación**: Recibe ticket con QR code
5. **Validación**: Museo escanea QR en entrada

## Estado del proyecto

### ✅ Completado
- **Estructura del proyecto** - Frontend/Backend organizados
- **Backend NestJS** - ✅ APIs completas implementadas
- **Base de datos Supabase** - ✅ Esquema anónimo con RLS policies
- **Frontend React/Vite** - ✅ FUNCIONANDO: Landing page completa del museo + sistema de checkout
- **APIs implementadas** - ✅ Eventos, Tickets, Pagos (modelo anónimo)
- **UI/UX moderna** - shadcn/ui + Tailwind CSS + diseño profesional de museo

### 🚀 Próximas fases (APIs anónimas)
- **APIs de eventos** - Listado y detalles públicos
- **Sistema de tickets anónimos** - Compra sin registro
- **Integración MercadoPago** - Pagos directos
- **Validación QR** - Control de acceso al museo

### 🔮 Próximas fases
- **Integración MercadoPago** - Pagos en línea
- **Panel administrativo** - Gestión completa
- **Validación QR** - Control de acceso
- **UI/UX completa** - Diseño profesional
- **Testing** - Cobertura completa
- **Deployment** - Producción lista

## Funcionalidades principales

- ✅ **Compra anónima** de tickets (sin registro)
- 🔄 Catálogo de eventos/exposiciones
- 🔄 Sistema de pagos con MercadoPago
- 🔄 Validación QR de tickets
- 🔄 Panel de administración
- 🔄 Control de capacidad y disponibilidad

## Instalación y desarrollo

### Backend (NestJS)
```bash
cd backend
npm install
npm run start:dev
```

### Frontend (React/Vite)
```bash
cd frontend
npm install
npm run dev
```
✅ **Frontend disponible en: `http://localhost:8080`** (funciona inmediatamente)

## Configuración de Supabase

1. Crear proyecto en Supabase
2. Configurar variables de entorno
3. Ejecutar migraciones de base de datos

### 📋 Información necesaria para continuar

Cuando tengas Supabase configurado, necesito:

**Backend (.env):**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

**Frontend (.env.local):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**MercadoPago (cuando esté listo):**
- `MERCADOPAGO_ACCESS_TOKEN`

Una vez que me proporciones esta información, podremos continuar con:
- ✅ Sistema de autenticación completo
- ✅ Endpoints de API
- ✅ Funcionalidades de frontend
- ✅ Integración con MercadoPago

## 🚀 Repositorio y desarrollo

### Estado del código
- ✅ **Backend**: NestJS configurado y listo
- ✅ **Frontend**: Next.js con estructura base
- ✅ **Base de datos**: Esquemas Supabase preparados
- ✅ **Git**: Repositorio inicializado y commit creado

### Próximos pasos
1. **Configurar Supabase** (ver `NEXT_STEPS.md`)
2. **Crear repositorio en GitHub** y hacer push
3. **Implementar autenticación** y funcionalidades

## Deployment

- Frontend: Vercel
- Backend: Railway/Heroku
- Base de datos: Supabase
