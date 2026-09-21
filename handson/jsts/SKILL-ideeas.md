# Kiro Skill Ideas for Awesome Pizza

The repository is a small Express and TypeScript API with shared domain models, MySQL persistence, and an OpenAPI contract. There is currently no `.kiro/skills/` directory.

## Recommended Skills

### 1. `awesome-pizza-endpoint-change`

**Priority:** Highest

**Use when:** Adding, modifying, or removing a REST endpoint.

The Skill should guide this workflow:

1. Update shared types in `src/model/Model.ts` when needed.
2. Add or update database operations in `src/api/database.ts`.
3. Implement request validation and handlers in `src/api/server.ts`.
4. Preserve the standard success and error envelopes.
5. Use appropriate HTTP status codes.
6. Synchronize `docs/openapi.yaml`.
7. Run TypeScript and targeted API validation.

This captures the most common cross-file workflow and helps prevent implementation and OpenAPI drift.

### 2. `mysql-repository-change`

**Priority:** High

**Use when:** Changing SQL queries, tables, seed data, or transaction behavior.

The Skill should check for:

- Parameterized SQL.
- Correct transaction commit, rollback, and connection release.
- Proper not-found semantics.
- Mapping SQL rows into types from `src/model/Model.ts`.
- Escaping the reserved table name `` `order` ``.
- Schema and seed-data synchronization.
- Environment-variable documentation.
- Avoidance of destructive or production database operations.

Database concerns currently span `src/api/database.ts`, `src/api/db/pool.ts`, `.env.example`, and sometimes the OpenAPI contract.

### 3. `openapi-contract-review`

**Priority:** High

**Use when:** Reviewing API changes or checking whether the implementation matches the specification.

The Skill should compare:

- Routes and HTTP methods.
- Request body requirements.
- Response status codes.
- Success and error envelopes.
- Authentication declarations.
- Type constraints.
- Required OpenAPI properties.

For example, `src/api/server.ts` currently accepts positive decimal quantities, while `src/api/database.ts` and `docs/openapi.yaml` require positive integers.

### 4. `repository-coherence-audit`

**Priority:** Medium

**Use when:** Checking whether implementation, documentation, steering, specs, and configuration still agree.

The Skill should inspect:

- `.kiro/steering/`
- `.kiro/specs/`
- `src/`
- `docs/openapi.yaml`
- `.env.example`
- `package.json`

This repository would benefit immediately because its steering still describes `database.ts` as an in-memory store, while the implementation now uses MySQL through `src/api/db/pool.ts`.

### 5. `request-validation-review`

**Priority:** Medium

**Use when:** Adding or reviewing HTTP request validation.

The Skill should generate or check boundary cases for:

- Missing or malformed request bodies.
- Blank strings.
- `null` array items.
- Empty arrays.
- Zero, negative, decimal, `NaN`, or string quantities.
- Invalid order statuses.
- Updates with no recognized fields.

POST and PUT currently duplicate validation, and some invalid values can reach the data layer and become `500` responses instead of `400` responses.

### 6. `mysql-integration-smoke`

**Priority:** Medium

**Use when:** Manually validating a local or disposable MySQL environment.

Suggested procedure:

1. Verify required environment variables.
2. Initialize the schema twice to check idempotency.
3. Confirm seed counts.
4. Exercise order create, read, update, and delete operations.
5. Verify transaction rollback and cascading item deletion.
6. Close the connection pool cleanly.

The Skill should explicitly exclude production databases and require credentials through environment variables.

### 7. `order-lifecycle-change`

**Priority:** Medium to low

**Use when:** Changing order statuses or lifecycle behavior.

The Skill should keep status changes synchronized across:

- The shared `order` type.
- The MySQL `ENUM`.
- HTTP request validation.
- OpenAPI `OrderStatus`.
- Seed data.
- Status transition rules.

This becomes particularly useful if the project introduces rules such as preventing `DELIVERED` to `RECEIVED` transitions or changes after an order is `CANCELED`.

### 8. `demo-auth-review`

**Priority:** Low

**Use when:** Modifying login, bearer-token, protected, or admin behavior.

The Skill should preserve the project's intentionally simplified demo-auth scope while checking:

- Consistent `401` versus `403` behavior.
- Standard response envelopes.
- OpenAPI security declarations.
- Which routes require authentication.
- That hardcoded credentials are never presented as production guidance.

## Recommended Starting Set

Start with these three Skills:

1. `awesome-pizza-endpoint-change`
2. `mysql-repository-change`
3. `openapi-contract-review`

Together, they cover most recurring work without over-engineering this learning project.

## Suggested Directory Structure

```text
.kiro/skills/
├── awesome-pizza-endpoint-change/
│   ├── SKILL.md
│   └── references/
│       └── endpoint-checklist.md
├── mysql-repository-change/
│   ├── SKILL.md
│   └── references/
│       └── transaction-checklist.md
└── openapi-contract-review/
    └── SKILL.md
```

## Example `SKILL.md`

```markdown
---
name: awesome-pizza-endpoint-change
description: Add, modify, or remove Awesome Pizza REST endpoints while keeping shared TypeScript models, the MySQL data layer, Express handlers, request validation, response envelopes, and docs/openapi.yaml synchronized.
---

# Workflow

1. Read the affected OpenAPI operation and relevant implementation.
2. Update shared domain shapes in `src/model/Model.ts` when necessary.
3. Keep database operations in `src/api/database.ts`.
4. Implement HTTP behavior in `src/api/server.ts`.
5. Validate input and return the standard response envelopes.
6. Update `docs/openapi.yaml`.
7. Run the available TypeScript and targeted API checks.
```

## What Should Not Become a Skill

- Stable project facts—TypeScript, Express, MySQL, file responsibilities, and response envelopes—belong in steering.
- Automatic checks after saves belong in a Kiro hook.
- One-off feature requirements belong in a spec.
- A restricted, read-only reviewer persona would be a custom agent.

Before adding Skills, correct the stale in-memory database statements in `.kiro/steering/product.md` and `.kiro/steering/structure.md`. Otherwise, newly created Skills may inherit contradictory project guidance.

## References

- [Kiro Agent Skills](https://kiro.dev/docs/skills.md)
- [Kiro Steering](https://kiro.dev/docs/steering.md)
- [Kiro Hooks](https://kiro.dev/docs/hooks.md)
- [Kiro Custom Agents](https://kiro.dev/docs/custom-agents.md)
