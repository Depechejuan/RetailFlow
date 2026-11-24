# Directrices de Testing

Testing revisa el código sin modificarlo y devuelve un informe reproducible a Develop.

## Prioridades

1. Consistencia transaccional del stock.
2. RLS, aislamiento por organización y autorización por rol.
3. Acciones IA sin escritura no confirmada.
4. Flujos E2E y regresiones visuales.

## Informe de defecto

Cada defecto incluye severidad, pasos, resultado esperado, resultado observado, evidencia,
archivo afectado y una propuesta de corrección. P0/P1 bloquean la aceptación de la tarea.

## Suite mínima

- Unitarias de validación, permisos, alertas y stock.
- Integración de seed, repositorios, Auth y RLS.
- E2E de login, dashboard, productos, movimientos, incidencias y asistente.
- Pruebas negativas con IDs de otras tiendas y payloads manipulados.
