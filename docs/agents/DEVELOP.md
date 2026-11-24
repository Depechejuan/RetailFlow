# Directrices de Develop

Antes de implementar cada módulo, leer `TESTING.md` y convertir sus casos en una lista
de comprobación.

- Mantener tipos de dominio en `src/lib/types.ts`.
- Centralizar reglas de negocio en `src/lib` o servicios de dominio.
- Validar entradas con esquemas Zod en el servidor.
- No crear consultas SQL arbitrarias desde la IA.
- No añadir dependencias si una utilidad existente resuelve el problema.
- Añadir pruebas unitarias para cada regla crítica.
- No modificar criterios de aceptación ni saltarse el paso de Testing.
- Usar commits pequeños y descriptivos.
