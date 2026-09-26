# Divvy · Frontend

App para dividir gastos compartidos entre grupos (roommates, viajes, eventos): registra gastos con tres tipos de división, calcula quién le debe a quién con el mínimo de transacciones y permite marcar deudas como pagadas.

**Stack:** Vue 3 (`<script setup>`) · Vite · Pinia · Vue Router · Axios · Tailwind CSS v4 · Vitest + Testing Library.

## Requisitos
- Node.js 20.19+ (o 22.12+)
- El [backend de Divvy](https://backend-divvy.onrender.com) (Spring Boot). En Render el plan gratuito duerme: la primera petición puede tardar 1–2 minutos y la app muestra un aviso paciente.

## Puesta en marcha

```bash
npm install
cp .env.example .env.local     # y ajusta VITE_API_URL
npm run dev                    # http://localhost:5173
```

| Variable | Descripción |
| --- | --- |
| `VITE_API_URL` | URL base del backend, sin barra final. Es una variable **de compilación**: Vite la incrusta al hacer `npm run build`. |

> El backend solo acepta peticiones (CORS) desde los orígenes de `CORS_ALLOWED_ORIGINS`. Por defecto: `http://localhost:5173` y `http://localhost:3000`. Para otro dominio hay que agregarlo allí.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Compila para producción en `dist/` |
| `npm run preview` | Sirve `dist/` localmente |
| `npm test` | Ejecuta todos los tests una vez (Vitest) |

## Estructura

Organizada por contexto del dominio; cada uno con `views/`, `components/`, `stores/` y `services/`:

```
src/
├── auth/            login, registro, recuperar y restablecer contraseña
├── grupos/          listar, crear (con moneda fija), miembros, archivar
├── gastos/          formulario con división igual / porcentaje / monto fijo, lista, editar, borrar
│   └── utils/division.js   validación de la suma en centavos (sin errores de coma flotante)
├── liquidaciones/   deudas Debe/Haber, pagar, historial de cálculos
├── usuarios/        caché de id → nombre (resuelve con GET /api/users/batch)
├── shared/          cliente HTTP con JWT, componentes base, estilos
└── router/          rutas y guard de autenticación
```

## Reglas de negocio que conviene conocer
- **La moneda es del grupo**: se elige al crearlo, la guarda el backend y todos los gastos deben usarla (el backend rechaza otra con 400).
- **`GET /api/groups/{id}/settlements` recalcula y guarda historial en cada llamada.** Por eso la vista de liquidaciones lo pide una sola vez al entrar y nunca en polling.
- **Pagar** una deuda solo es posible sobre la liquidación más reciente del grupo; si otra persona recalculó mientras tanto, la app avisa y ofrece "Actualizar deudas".
- Las deudas pagadas se descuentan del balance: al recalcular no vuelven a aparecer.

## Despliegue
Sitio estático (`npm run build` → `dist/`). Necesita:
1. Reescribir toda ruta a `index.html` (Vue Router usa `createWebHistory`).
2. `VITE_API_URL` definida **antes** de compilar.
3. La URL final del sitio agregada a `CORS_ALLOWED_ORIGINS` en el backend.
