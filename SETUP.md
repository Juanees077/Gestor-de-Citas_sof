# Guía de Despliegue — Todo GRATIS

## Stack tecnológico (100% gratuito)

| Servicio | Uso | Tier gratuito |
|---|---|---|
| **Vercel** | Hosting del sitio Next.js | ✅ Ilimitado para proyectos personales |
| **Supabase** | Base de datos PostgreSQL + Auth | ✅ 500 MB DB, 50k usuarios |
| **Resend** | Emails de recordatorio | ✅ 3,000 emails/mes |

---

## Paso 1: Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratuita
2. Crea un nuevo proyecto (anota la contraseña)
3. Ve a **SQL Editor** y ejecuta todo el contenido de `supabase/schema.sql`
4. Ve a **Settings → API** y copia:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

## Paso 2: Crear usuario administrador en Supabase

1. Ve a **Authentication → Users**
2. Haz click en **"Add user"**
3. Ingresa el email y contraseña que usarás para el panel admin
4. (No necesitas confirmar el email si está en modo desarrollo)

## Paso 3: Configurar emails con Resend (opcional)

1. Crea cuenta en [resend.com](https://resend.com)
2. Crea un API Key
3. Copia el key → `RESEND_API_KEY`

> ⚠️ Para enviar a cualquier email (no solo el tuyo), necesitas verificar un dominio en Resend.

## Paso 4: Desplegar en Vercel

1. Sube el proyecto a GitHub
2. Ve a [vercel.com](https://vercel.com) y conecta tu repositorio
3. En **Environment Variables** agrega todas las variables de `.env.local.example`
4. ¡Despliega!

## Paso 5: Configurar el negocio

1. Ve a `tu-dominio.vercel.app/admin/login`
2. Inicia sesión con el usuario que creaste en Supabase
3. Ve a **Configuración** y completa:
   - Datos del negocio (nombre, teléfono, dirección, Instagram)
   - Horarios laborales
   - Servicios y precios

---

## Rutas del sistema

| Ruta | Descripción |
|---|---|
| `/` | Página de inicio (pública) |
| `/reservar` | Reservar cita (clientes) |
| `/mis-citas` | Ver/cancelar citas (clientes) |
| `/admin/login` | Login administrativo |
| `/admin` | Dashboard admin |
| `/admin/calendario` | Vista de calendario semanal |
| `/admin/citas` | Gestión completa de citas |
| `/admin/configuracion` | Configuración del negocio |

## Desarrollo local

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar y configurar variables de entorno
cp .env.local.example .env.local
# edita .env.local con tus claves de Supabase

# 3. Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)
