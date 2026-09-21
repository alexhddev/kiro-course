---
name: awesome-pizza-endpoint-change
description: Add, modify, or remove Awesome Pizza REST endpoints while keeping shared TypeScript models, MySQL persistence, Express handlers, request validation, response envelopes, status codes, and docs/openapi.yaml synchronized. Use for endpoint, route, request, response, menu, order, auth, or OpenAPI changes in this workspace.
---

# Awesome Pizza endpoint changes

Use this workflow for every REST API contract change. Change only the layers affected by the requested behavior.

## Workflow

1. Read the affected operation in `docs/openapi.yaml` and trace its current route, shared types, and data helpers before editing.
2. Define reusable domain, request, or response shapes in `src/model/Model.ts` when needed; do not duplicate shared shapes in handlers.
3. Put persisted operations in `src/api/database.ts`. Keep SQL parameterized and keep direct pool access out of route handlers.
4. Update `src/api/db/pool.ts` only when the change affects schema, constraints, statuses, seed data, or database bootstrap. Do not treat `CREATE TABLE IF NOT EXISTS` as a migration for existing tables.
5. Implement HTTP behavior in `src/api/server.ts`: validate input before calling the data layer, apply required auth, wrap unexpected failures, and return the standard envelopes and appropriate status codes.
6. Update `docs/openapi.yaml` in the same change so the method, path, parameters, body, schemas, security, and every response match the implementation.
7. Read and complete `references/endpoint-checklist.md` before reporting completion.
8. Run the available TypeScript check and targeted API checks. State clearly when database-backed or contract validation cannot be run.

Do not add dependencies or redesign the architecture unless the endpoint requires it.
