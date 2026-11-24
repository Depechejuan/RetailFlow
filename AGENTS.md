# RetailFlow — instrucciones de agentes

## Orchestrator

El Orchestrator define la arquitectura, divide las tareas y acepta una fase solo con
evidencia reproducible. El flujo obligatorio es Orchestrator → Develop → Testing →
corrección → Testing. Cada tarea tiene un máximo de tres ciclos de corrección.

## Arquitectura

- Next.js App Router y TypeScript estricto.
- Server Components para lecturas; Server Actions o Route Handlers para escrituras.
- Supabase Auth + PostgreSQL + RLS cuando haya credenciales configuradas.
- Las mutaciones de inventario pasan por servicios de dominio y una transacción.
- La UI puede ejecutar `demo`, pero nunca debe presentar el mock como negocio real.
- La IA solo usa herramientas allowlist; nunca SQL generado por el modelo.

## Seguridad

- Validar en cliente y servidor.
- Comprobar permisos en servidor; ocultar un botón no es autorización.
- Nunca exponer `SUPABASE_SECRET_KEY` ni `AI_API_KEY` al navegador.
- Productos con historial se archivan, no se borran físicamente.
- Todo movimiento es inmutable y corregible mediante ajuste compensatorio.

## Criterio de finalización

Una tarea requiere código, pruebas relevantes, lint, typecheck y una nota de evidencia.
Testing no modifica código de Develop. Un defecto persistente tras tres ciclos se eleva
al Orchestrator y la tarea se detiene.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
