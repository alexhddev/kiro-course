# Implementation Plan: MySQL Database Integration

## Overview

Replace the in-memory data layer with a MySQL-backed layer using `mysql2`. Work proceeds from dependency and connection pool setup, through schema/seed bootstrap, to rewriting the data-access helpers as async functions, and finally wiring the server to `await` them and bootstrap the database at startup.

## Tasks

- [x] 1. Add dependency and connection pool
  - [x] 1.1 Add `mysql2` dependency
    - Add `mysql2` to `dependencies` in `package.json`
    - Run `npm install` to update `package-lock.json`
    - _Requirements: 1.1_

- [x] 2. Create the connection pool and bootstrap module (`src/api/db/pool.ts`)
  - [x] 2.1 Create env-configured `mysql2` pool
    - Import `mysql from 'mysql2/promise'` and export `pool` created with `createPool`
    - Read `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` from env with documented defaults (`localhost`, `3306`, `root`, `password`, `awesome_pizza`)
    - Set `connectTimeout: 10_000`, `waitForConnections: true`, `connectionLimit: 10`
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 2.2 Implement `initSchema()`
    - Run DDL to create `menu`, back-quoted `` `order` ``, and `order_item` tables if they do not exist
    - Constrain `order.status` with a `status ENUM('RECEIVED','DELIVERING','DELIVERED','CANCELED')`
    - Link `order_item.order_id` to `` `order`(id) `` via a foreign key with `ON DELETE CASCADE`
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 2.3 Implement idempotent `seedIfEmpty()`
    - Guard menu seeding with `SELECT COUNT(*)` on `menu`; seed the 5 original menu entries only when empty
    - Guard order seeding with `SELECT COUNT(*)` on `` `order` ``; seed the 3 original seed orders only when empty
    - Insert each order plus its `order_item` rows inside a transaction
    - Leave existing records unchanged on a non-empty store
    - _Requirements: 2.4, 2.5_

- [x] 3. Checkpoint - verify pool and bootstrap compile
  - Ensure the project type-checks/compiles, ask the user if questions arise.

- [x] 4. Rewrite the data layer (`src/api/database.ts`)
  - [x] 4.1 Replace `dailyMenu` array with async `getDailyMenu()`
    - Query all `menu` rows and map them to `menu_entry` (name, description, imageUrl)
    - Return an empty array when no rows exist
    - _Requirements: 3.1, 3.2, 8.2, 8.3_

  - [x] 4.2 Keep `generateOrderId()` synchronous
    - Preserve the existing ID generation logic and signature
    - _Requirements: 8.1_

  - [x] 4.3 Implement async `findOrderById(id)`
    - Reject with an invalid-identifier error when `id` is missing or blank
    - Join `` `order` `` with `order_item` and map to `order` with populated `contents`
    - Resolve to `undefined` when no matching order exists
    - _Requirements: 4.1, 4.2, 4.3, 8.4_

  - [x] 4.4 Implement async `addOrder(orderData)`
    - Guard against empty sender and empty/invalid contents (missing name or non-positive quantity)
    - Insert the `order` row (status `RECEIVED`, generated id) and its `order_item` rows in a transaction
    - Resolve to the stored `order` including the generated id
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 8.1, 8.2_

  - [x] 4.5 Implement async `updateOrderById(id, updatedOrder)`
    - Update only the provided fields among sender, status, and contents; leave omitted fields unchanged
    - Reject invalid status and invalid contents, leaving the stored order unchanged
    - Replace `order_item` rows within a transaction when contents are updated
    - Resolve to `null` when the order does not exist; otherwise resolve to the updated `order`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 8.4_

  - [x] 4.6 Implement async `deleteOrderById(id)`
    - Reject with an invalid-identifier error when `id` is missing or blank
    - Delete the `` `order` `` row (cascade removes `order_item` rows)
    - Resolve to `true` on deletion and `false` when the order does not exist
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 8.4_

- [x] 5. Checkpoint - verify data layer compiles
  - Ensure the project type-checks/compiles, ask the user if questions arise.

- [x] 6. Wire the server (`src/api/server.ts`)
  - [x] 6.1 Update imports and await helper calls
    - Import `getDailyMenu` instead of `dailyMenu`
    - Change the daily-menu handler to `data: await getDailyMenu()`
    - Add `await` to `findOrderById`, `addOrder`, `updateOrderById`, and `deleteOrderById` calls
    - _Requirements: 8.2, 8.3, 8.4_

  - [x] 6.2 Add database startup bootstrap
    - Before `app.listen`, create the pool then `await initSchema()` then `await seedIfEmpty()`
    - On failure, log the error and `process.exit(1)` without starting the server
    - _Requirements: 1.3, 1.4_

- [x] 7. Final checkpoint - Ensure the project compiles and starts against a local MySQL
  - Ensure all checks pass, ask the user if questions arise.

## Notes

- The design has no Correctness Properties section (CRUD layer dominated by external I/O), so no property-based tests are included.
- Each task references specific requirements for traceability.
- Checkpoints ensure incremental validation as the pool, data layer, and server wiring come together.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1"] },
    { "id": 1, "tasks": ["2.2"] },
    { "id": 2, "tasks": ["2.3"] },
    { "id": 3, "tasks": ["4.1", "4.2", "4.3", "4.4", "4.5", "4.6"] },
    { "id": 4, "tasks": ["6.1", "6.2"] }
  ]
}
```
