# Repository coherence checklist

Use applicable checks and cite concrete file paths for every discrepancy.

## Product and architecture

- [ ] Compare claimed capabilities and demo limitations in `.kiro/steering/product.md` with implemented routes and persistence.
- [ ] Compare `.kiro/steering/structure.md` with the actual file tree, imports, and layer boundaries.
- [ ] Confirm `.kiro/steering/tech.md`, `package.json`, and `tsconfig.json` agree on language, module system, runtime, framework, libraries, and commands.
- [ ] Confirm handlers use helpers in `src/api/database.ts` rather than issuing SQL or accessing `pool` directly.
- [ ] Confirm schema, connection, and seed responsibilities remain in `src/api/db/pool.ts`.

## REST contract

For every operation affected by the audit:

- [ ] Compare method and path between `src/api/server.ts` and `docs/openapi.yaml`.
- [ ] Compare path/query parameters and request-body requiredness.
- [ ] Compare validation constraints, including blank strings, array size, null items, quantity integer/minimum rules, and allowed statuses.
- [ ] Compare success and error status codes and exact envelope properties.
- [ ] Compare authentication middleware and authorization behavior with OpenAPI security declarations.
- [ ] Identify undocumented routes, unimplemented operations, stale schemas, and schemas whose required or nullable properties differ from responses.

## Domain and MySQL

- [ ] Compare shared shapes and status unions in `src/model/Model.ts` with OpenAPI schemas, SQL mappings, table definitions, validation, and seed data.
- [ ] Compare database helper behavior with its callers: input assumptions, not-found values, errors, transaction boundaries, and returned shapes.
- [ ] Confirm SQL uses placeholders for values and consistently escapes the reserved `` `order` `` table name.
- [ ] Check that multi-statement writes commit, roll back, and release connections correctly.
- [ ] Check schema constraints and seeds against documented data rules; remember that create-table DDL does not migrate existing tables.

## Specs and completion records

- [ ] For each feature under `.kiro/specs/`, compare requirements and design with current implementation and configuration.
- [ ] Verify completed tasks have observable implementation evidence and incomplete tasks are not described as delivered.
- [ ] Flag obsolete design statements, stale requirement references, or task metadata that disagrees with `tasks.md`.
- [ ] Do not reinterpret historical intent as current behavior without evidence.

## Configuration and operations

- [ ] Compare every environment variable read by source code with `.env.example`, including defaults, types, and purpose. Never expose `.env` secret values in an audit report.
- [ ] Compare executable defaults with comments, steering, specs, and examples.
- [ ] Compare `package.json` scripts with documented commands and startup entry points.
- [ ] Confirm direct dependencies used by source are declared and `package-lock.json` is synchronized with `package.json`.
- [ ] Check whether documented validation commands actually exist before recommending them.

## Reporting and fixes

- [ ] Order findings as high (behavior, contract, or data risk), medium (operational or persistent-guidance drift), then low (stale wording or maintainability).
- [ ] Separate confirmed findings from items that require a running server, database, secrets, or external tooling to verify.
- [ ] Include a concise checked-without-findings section so audit coverage is visible.
- [ ] Recommend the smallest correction that restores agreement; do not broaden scope unnecessarily.
- [ ] If applying fixes, re-check every surface named in each finding and run available static or targeted runtime validation.
