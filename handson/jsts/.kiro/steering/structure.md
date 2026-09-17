# Project Structure

```
.
├── docs/
│   └── openapi.yaml      # OpenAPI 3.0 spec — source of truth for the REST API
├── src/
│   ├── api/
│   │   ├── server.ts     # Express app: routes, middleware, auth, server bootstrap
│   │   └── database.ts   # In-memory data (menu, orders) + data-access helpers
│   └── model/
│       └── Model.ts      # Shared TypeScript type definitions
├── package.json
└── package-lock.json
```

## Layering & responsibilities

- **`src/model/Model.ts`** — Shared domain types (`menu_entry`, `order`). Define data shapes here and import them where needed rather than redefining inline.
- **`src/api/database.ts`** — The in-memory "data layer". Holds the `dailyMenu` and `orders` arrays and exposes helper functions (`findOrderById`, `addOrder`, `updateOrderById`, `generateOrderId`). Route handlers should go through these helpers, not touch the arrays directly.
- **`src/api/server.ts`** — The HTTP layer. Defines Express routes, request validation, auth middleware, and starts the server.

## Conventions for new code

- Add new endpoints in `server.ts`, delegate data operations to helpers in `database.ts`, and reference types from `Model.ts`.
- When adding or changing an endpoint, update `docs/openapi.yaml` to match.
- Keep the layering intact: HTTP concerns in `api/`, domain types in `model/`. Avoid mixing data access into route handlers beyond calling the provided helpers.
