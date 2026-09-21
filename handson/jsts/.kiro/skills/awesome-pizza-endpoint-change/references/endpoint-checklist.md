# Endpoint change checklist

Use the applicable sections before completing an endpoint addition, modification, or removal.

## Scope and layering

- [ ] Read both the OpenAPI operation and its current implementation first.
- [ ] Put reusable shapes in `src/model/Model.ts`.
- [ ] Put SQL and persistence logic in `src/api/database.ts`; handlers never query `pool` directly.
- [ ] Update `src/api/db/pool.ts` only for schema, constraints, statuses, seed data, or bootstrap behavior.
- [ ] For persisted-shape changes, account for existing databases; changing create-table DDL alone is not a migration.
- [ ] Remove obsolete types, helpers, schemas, and operations when deleting an endpoint.

## HTTP behavior

- [ ] Validate path, query, and body input before data access.
- [ ] Reject blank required strings, null collection items, empty required arrays, and wrong primitive types with `400`.
- [ ] Require item quantities to satisfy `Number.isInteger(quantity) && quantity > 0`.
- [ ] Decide explicitly whether an update body may be empty, and keep code and OpenAPI aligned.
- [ ] Apply bearer-token or admin authorization where required.
- [ ] Use `200` for successful reads/updates/deletes, `201` for creation, `400` for invalid input, `401`/`403` for auth failures, `404` for missing resources, and `500` only for unexpected failures.
- [ ] Wrap handler logic in `try/catch` and preserve the envelopes:
  - Success: `{ success: true, data, message }`
  - Error: `{ success: false, error, message }`

## MySQL behavior

- [ ] Use placeholders for values in every SQL statement and escape the reserved `` `order` `` table name.
- [ ] Map query results into shared model types.
- [ ] For multi-statement writes, commit on success, roll back on failure, and release the connection in `finally`.
- [ ] Preserve clear not-found semantics and avoid partial writes.
- [ ] Keep schema constraints, status values, seed data, and environment documentation synchronized when affected.

## OpenAPI contract

- [ ] Match the route, method, path/query parameters, request-body requiredness, and authentication declaration.
- [ ] Match required properties, string/array limits, integer constraints, enums, nullability, and unknown-field behavior.
- [ ] Document every status code and the exact success or error envelope returned by the handler.
- [ ] Reuse component schemas where practical and remove stale contract elements.

## Validation

- [ ] Run `npx tsc --noEmit` or the repository's current equivalent.
- [ ] Exercise the changed endpoint's normal success case and verify its status and envelope.
- [ ] Exercise applicable invalid, boundary, null, empty, decimal, not-found, unauthenticated, and unauthorized cases; client errors must not become `500` responses.
- [ ] For writes, verify persisted rows and transaction rollback/no partial data on failure.
- [ ] For schema or seed changes, initialize twice and verify idempotence against a disposable database.
- [ ] Run an OpenAPI 3.0 validator if one is available; otherwise manually compare the changed operation with observed responses.
