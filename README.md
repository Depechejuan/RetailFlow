# RetailFlow

Gestión inteligente de inventario multi-tienda para la prueba técnica de Speed Paradigm.

## Estado

La aplicación funciona en `demo` con datos reproducibles y está preparada para conectar
Supabase Auth y PostgreSQL cuando se configure un proyecto. No se incluyen credenciales.

## Stack

- Next.js App Router + TypeScript estricto
- Tailwind CSS 4 + componentes propios inspirados en shadcn/ui
- Supabase Auth, PostgreSQL y RLS (pendiente de configurar)
- Vitest, React Testing Library y Playwright
- Vercel

## Desarrollo local

```bash
npm install
npm run dev
```

Abre <http://localhost:3000>. El modo demo no requiere variables de entorno.

## Variables de entorno

Copia `.env.example` a `.env.local`. Para conectar Supabase será necesario crear un
proyecto en <https://supabase.com/dashboard>, obtener las claves desde `Settings > API
Keys` y confirmar su configuración antes de ejecutar migraciones.

Las claves secretas nunca deben llegar al navegador ni subirse a Git.

`SUPABASE_JWKS_URL` se conserva para verificaciones JWT server-side futuras; la sesión
actual se valida mediante Supabase SSR.

## Supabase: siguiente paso

La aplicación no se conecta a Supabase automáticamente. Cuando exista un proyecto y
las variables estén configuradas, aplica las migraciones y el seed desde el SQL Editor
o con Supabase CLI:

```bash
supabase db push
supabase db reset
```

Después crea un usuario en Auth y vuelve a ejecutar `supabase/seed/seed.sql`; el seed
asocia el primer perfil a la organización demo y asigna sus tres tiendas. Hasta ese
momento, la aplicación conserva el modo demo de lectura.

## Comprobaciones

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Agentes

- `AGENTS.md`: reglas del Orchestrator y arquitectura.
- `docs/agents/DEVELOP.md`: directrices de implementación.
- `docs/agents/TESTING.md`: estrategia de validación.
