# Design Document

## Overview

Replace the in-memory data layer in `src/api/database.ts` with a MySQL-backed layer using the `mysql2` driver (promise API + connection pooling). The public helper names are preserved but converted to async (Promise-returning). Menu and order data move into three tables (`menu`, `order`, `order_item`). Route handlers in `src/api/server.ts` need minimal edits to `await` the now-async helpers.

The API contract (`docs/openapi.yaml`) is unchanged because request/response behavior is preserved, so no OpenAPI edits are needed.

## Architecture

Layering is unchanged:

- `src/model/Model.ts` — shared types (`menu_entry`, `order`); no changes.
- `src/api/database.ts` — data layer, rewritten to run SQL against a MySQL connection pool and map rows to `Model.ts` types.
- `src/api/server.ts` — HTTP layer; route handlers add `await` on the now-async helpers.

A new module holds the connection pool and schema/seed bootstrap so `database.ts` stays focused on data access:

- `src/api/db/pool.ts` — creates and exports the `mysql2` pool from env config; exposes `initSchema()` (DDL) and `seedIfEmpty()` (idempotent seed).

### Dependency

Add `mysql2` to `dependencies` in `package.json` (promise support and pooling built in). No `@types` package needed — `mysql2` ships its own types.

### Startup sequence

`server.ts` bootstraps the database before `app.listen`:

1. Create the pool (`pool.ts`).
2. `await initSchema()` — create tables if they do not exist.
3. `await seedIfEmpty()` — seed the 5 menu entries and 3 orders only when the store is empty.
4. On success, start listening. On connection/init failure, log the error and exit (do not serve requests). This satisfies Requirement 1.3–1.4.

## Components and Interfaces

### `src/api/db/pool.ts`

```ts
import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? 'password',
  database: process.env.DB_NAME ?? 'awesome_pizza',
  connectTimeout: 10_000, // Requirement 1.3: 10s connection timeout
  waitForConnections: true,
  connectionLimit: 10,
});

export async function initSchema(): Promise<void> { /* run DDL, see Data Models */ }
export async function seedIfEmpty(): Promise<void> { /* idempotent seed, see below */ }
```

Documented env vars and defaults:

| Env var       | Default          | Purpose            |
| ------------- | ---------------- | ------------------ |
| `DB_HOST`     | `localhost`      | MySQL host         |
| `DB_PORT`     | `3306`           | MySQL port         |
| `DB_USER`     | `root`           | MySQL user         |
| `DB_PASSWORD` | `password`       | MySQL password     |
| `DB_NAME`     | `awesome_pizza`  | Database name      |

### `src/api/database.ts` (rewritten helpers)

Signatures keep their names and parameter types; return types become Promises that resolve to the same value shapes, preserving not-found sentinels (Requirement 8).

```ts
// Menu access — replaces the exported `dailyMenu` array with an async accessor.
export const getDailyMenu = (): Promise<menu_entry[]> => { ... }

export const generateOrderId = (): string => { ... }              // unchanged, sync

export const findOrderById = (id: string): Promise<order | undefined> => { ... }
export const addOrder = (orderData: Omit<order, 'id'>): Promise<order> => { ... }
export const updateOrderById = (id: string, updatedOrder: Partial<order>): Promise<order | null> => { ... }
export const deleteOrderById = (id: string): Promise<boolean> => { ... }
```

Not-found return values are preserved: `findOrderById` → `undefined`, `updateOrderById` → `null`, `deleteOrderById` → `false`.

**Interface deviation (call-out):** the current code exports `dailyMenu` as a plain array that `server.ts` imports directly. A MySQL read cannot be synchronous, so `dailyMenu` becomes an async accessor `getDailyMenu()`. This is the one unavoidable break from "same access name" (Requirement 8.3); the `GET /api/daily-menu` handler changes from `data: dailyMenu` to `data: await getDailyMenu()`.

### `src/api/server.ts` (minimal edits)

- Import `getDailyMenu` instead of `dailyMenu`.
- Add `await` to helper calls in the four affected handlers (`findOrderById`, `addOrder`, `updateOrderById`, `deleteOrderById`, `getDailyMenu`). Handlers are already wrapped in `try/catch`, so a rejected promise falls through to the existing `500` error envelope.
- Add the bootstrap (create pool → `initSchema` → `seedIfEmpty`) before `app.listen`.

Order helpers map to `order` objects by joining `order` with its `order_item` rows so `contents` is populated.

## Data Models

Types in `Model.ts` are unchanged. Table structure:

```sql
CREATE TABLE IF NOT EXISTS menu (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  imageUrl VARCHAR(512) NOT NULL
);

CREATE TABLE IF NOT EXISTS `order` (
  id VARCHAR(64) PRIMARY KEY,
  sender VARCHAR(255) NOT NULL,
  status ENUM('RECEIVED','DELIVERING','DELIVERED','CANCELED') NOT NULL
);

CREATE TABLE IF NOT EXISTS order_item (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  CONSTRAINT fk_order_item_order
    FOREIGN KEY (order_id) REFERENCES `order`(id)
    ON DELETE CASCADE
);
```

Notes:
- `order` is a reserved word in MySQL, so it is always back-quoted in SQL.
- The `status` ENUM enforces Requirement 2.2 at the schema level.
- `ON DELETE CASCADE` means deleting an `order` row removes its `order_item` rows (Requirement 7.1), so `deleteOrderById` issues a single `DELETE` against `order`.
- Row → type mapping: `menu` rows map directly to `menu_entry`; an `order` row plus its `order_item` rows map to `order` with `contents = [{ name, quantity }, ...]`.

### Idempotent seed

`seedIfEmpty()` checks `SELECT COUNT(*)` on `menu` and on `order`. It seeds the 5 menu entries only when `menu` is empty and the 3 seed orders (with their items) only when `order` is empty, wrapping each order + items insert in a transaction. On a non-empty store it inserts nothing (Requirement 2.4–2.5).

## Error Handling

- **Connection failure at startup** (Req 1.3–1.4): if pool creation, `initSchema`, or `seedIfEmpty` rejects, `server.ts` logs the error and calls `process.exit(1)` before `app.listen` — the API never serves against an unavailable store.
- **Query failure during a request** (Req 3.3, 4.4, 5.5, 6.5): helpers let the driver error propagate (reject). The existing `try/catch` in each route handler returns the standard `500` error envelope and, for updates/deletes, no partial change is returned since failed writes throw before returning.
- **Invalid identifier** (Req 4.3, 7.4): `findOrderById` / `deleteOrderById` treat a missing or empty/blank `id` as invalid and reject with an error rather than querying.
- **Validation** (Req 5.3–5.4, 6.3–6.4): input validation (empty sender, empty/invalid contents, invalid status) already lives in the `server.ts` handlers and stays there; helpers additionally guard against empty sender / empty contents so the data layer never persists invalid orders. Failed validation persists nothing.
- **Write atomicity**: `addOrder` and content-changing updates insert the `order` row and its `order_item` rows inside a transaction so a partial write cannot occur.

## Testing Strategy

Property-based testing does not apply here: this is a CRUD data layer whose behavior is dominated by external I/O (the MySQL store) rather than pure input→output logic, so there are no meaningful universal "for all inputs" properties to assert. Verification is example-based instead:

- Manual/integration verification against a local MySQL instance: start the server, confirm schema creation and one-time seeding, then exercise `GET /api/daily-menu`, `GET/POST/PUT/DELETE /api/orders`, and confirm responses match the pre-migration behavior and that cascade delete removes order items.
- Re-run startup against a non-empty store to confirm no re-seeding occurs.
