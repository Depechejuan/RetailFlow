# RetailFlow

Gestión inteligente de inventario multi-tienda para la prueba técnica de Speed Paradigm.

## Estado

La aplicación funciona en `demo` y está conectada a Supabase cuando se configuran las
variables de entorno. El esquema y la seed de demostración ya están preparados para
la organización multi-tienda. No se incluyen credenciales.

## Stack

- Next.js App Router + TypeScript estricto
- Tailwind CSS 4 + componentes propios inspirados en shadcn/ui
- Supabase Auth, PostgreSQL y RLS
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

## Supabase

Con las variables configuradas, aplica las migraciones y el seed desde el SQL Editor o
con Supabase CLI:

```bash
supabase db push
supabase db reset
```

Después crea un usuario en Auth y vuelve a ejecutar `supabase/seed/seed.sql`; el seed
asocia el primer perfil a la organización demo y asigna sus tres tiendas. Hasta ese
momento, la aplicación conserva el modo demo de lectura.

En este entorno, la migración y la seed ya se han aplicado y las tablas principales
responden correctamente desde la API de Supabase.

## Producción en Vercel

Conecta el repositorio `Depechejuan/RetailFlow` a Vercel y configura en el entorno
`Production` las variables de `.env.example`. Usa `AI_MODE=demo` si no se va a activar
un proveedor de IA con coste. `SUPABASE_SECRET_KEY` debe ser una variable server-only
y nunca debe exponerse al navegador.

La protección de Vercel debe permanecer desactivada para el dominio de producción; la
protección de RetailFlow seguirá aplicándose en sus rutas privadas mediante Supabase
Auth. Verifica el dominio público en una ventana de incógnito después del despliegue.

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
