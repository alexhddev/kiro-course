# Repository coherence audit

Read-only audit completed. **No files were modified during the audit**, and the working tree was clean at validation time.

## Findings

### High — Invalid order input can produce `500` instead of `400`

**Conflict:** Order handlers accept values later rejected by the data layer:

- Decimal quantities pass HTTP validation but fail the data layer’s integer check: `src/api/server.ts:129-145`, `230-246` vs. `src/api/database.ts:90-95`, `184-189`.
- A `null` item throws when accessing `item.name`, reaching the generic `500` handler.
- Whitespace-only order IDs pass `if (!id)` but are rejected by helpers: `src/api/server.ts:73-81`, `175-183`, `279-287` vs. `src/api/database.ts:29-31`, `231-233`.
- Conversely, OpenAPI lacks non-empty constraints for sender, item names, and contents, although handlers reject them: `docs/openapi.yaml:339-395`.

This conflicts with the documented `400` validation policy and OpenAPI’s positive-integer quantity rule.

**Impact:** Invalid client input can be reported as an internal failure, while OpenAPI-generated clients can send schema-valid requests that handlers reject.

**Recommended source of truth:** Handler validation policy and the endpoint checklist.

**Smallest correction:** Reject null items, require `Number.isInteger(quantity)`, trim IDs, and add matching `minLength`/`minItems` constraints to OpenAPI.

### High — Authentication responses violate the standard envelope

**Conflict:**

- Login returns `{ success, token }` or `{ success, error }`, omitting required envelope fields: `src/api/server.ts:326-334`.
- Admin success omits `data`: `src/api/server.ts:366-370`.
- Login destructures `req.body` without validation or `try/catch`; a missing/null body can escape through Express’s default error response.
- An admin token decoding to JSON `null` causes `payload.role` to throw outside the parsing `try/catch`.
- Corresponding `400`/`500` outcomes are absent from `docs/openapi.yaml:205-287`.

**Impact:** Clients receive inconsistent and sometimes undocumented response shapes.

**Recommended source of truth:** `.kiro/steering/tech.md` response-envelope convention.

**Smallest correction:** Validate authentication input and decoded payloads, wrap unexpected failures, return standard envelopes, and update OpenAPI accordingly.

### Medium — Architecture steering still describes in-memory storage

**Conflict:**

- `.kiro/steering/product.md:14` says data is not persistent.
- `.kiro/steering/structure.md:4-27` says `database.ts` holds in-memory arrays and omits `src/api/db/pool.ts`.
- Current code uses MySQL, initializes schema and seed data, and refuses startup on bootstrap failure: `src/api/database.ts`, `src/api/db/pool.ts:30-143`, `src/api/server.ts:376-390`.
- The MySQL migration spec tasks are all marked complete.

**Impact:** Persistent workspace guidance directs future changes toward architecture that no longer exists.

**Recommended source of truth:** Current implementation and completed MySQL spec.

**Smallest correction:** Update product and structure steering to describe MySQL, `getDailyMenu()`, and `db/pool.ts`. Keep the intentional hardcoded-auth demo warning.

### Medium — Conflicting default MySQL password

Runtime and `.env.example` use an empty password, while documentation says `password`:

- Runtime: `src/api/db/pool.ts:18-24`
- Environment example: `.env.example:5-9`
- Contradictory pool comment: `src/api/db/pool.ts:8-16`
- Contradictory spec text: `.kiro/specs/mysql-database-integration/design.md:41-65`, `tasks.md:17-21`

**Impact:** Developers following the design can use credentials different from runtime defaults.

**Recommended source of truth:** Runtime plus `.env.example`.

**Smallest correction:** Change the pool comment and spec wording to document an empty default—or deliberately change runtime and `.env.example` together.

### Medium — Seed behavior conflicts with the requirement

Requirement 2.5 says a non-empty store receives no seed data: `.kiro/specs/mysql-database-integration/requirements.md:35-40`.

Implementation checks the menu and order tables independently: `src/api/db/pool.ts:104-124`. A database with menu entries but no orders will therefore receive seed orders. The design contains both the independent-check description and the contradictory “non-empty store inserts nothing” claim.

**Recommended source of truth:** The implemented per-table guards appear to match the detailed design intent.

**Smallest correction:** Rewrite the requirement and ambiguous design sentence in per-table terms. Otherwise, change implementation to make one global emptiness decision.

### Medium — Generated order IDs are not guaranteed unique

Requirement 5.1 promises a unique generated ID, but `generateOrderId()` combines milliseconds with only 1,000 random values and does not retry primary-key collisions: `src/api/database.ts:20-24`.

**Impact:** Concurrent valid creates can fail nondeterministically with `500`.

**Recommended source of truth:** The uniqueness requirement and database primary key.

**Smallest correction:** Use a collision-resistant ID such as UUID, or retry creation after duplicate-key errors.

### Medium — Invalid OpenAPI 3.0 null schema

`docs/openapi.yaml:1` declares OpenAPI 3.0.3, but the delete response uses `type: null` at `docs/openapi.yaml:169-179`. `null` is not a valid OpenAPI 3.0 schema type.

**Impact:** Strict validators and code generators may reject the API contract.

**Smallest correction:** Use an OpenAPI-3.0-compatible nullable schema while preserving the runtime `data: null` response.

### Low — Daily-menu accessor conflicts with spec traceability

Requirement 8.3 requires the original daily-menu access name, while the design acknowledges replacing `dailyMenu` with async `getDailyMenu()`. Completed tasks claim this satisfies the unchanged-access requirement:

- `.kiro/specs/mysql-database-integration/requirements.md:102-108`
- `.kiro/specs/mysql-database-integration/design.md:74-85`
- `.kiro/specs/mysql-database-integration/tasks.md:39-43`, `78-82`
- Current implementation: `src/api/database.ts:7-17`, `src/api/server.ts:52-62`

**Smallest correction:** Revise Requirement 8.3 to permit the async accessor. Public HTTP behavior is unaffected.

### Low — OpenAPI envelope schemas are too permissive

`ApiResponse`, `ApiErrorResponse`, and `LoginResponse` do not require their documented properties. Success values are general booleans instead of being constrained to their respective success/error values: `docs/openapi.yaml:304-323`, `408-417`.

**Impact:** The contract does not reliably enforce the envelope policy and masks current auth drift.

**Smallest correction:** Mark envelope fields required and constrain success values after standardizing login/admin responses.

## Areas with no observed drift

- All seven implemented API operations are represented in OpenAPI; no documented operation lacks an implementation.
- Bearer security declarations match protected and admin routes.
- The four order statuses align across TypeScript models, OpenAPI, MySQL ENUM definitions, row mappings, and seed data.
- Route handlers use `database.ts` helpers instead of directly issuing SQL.
- SQL values are parameterized; create/update/seed multi-step writes use transactions.
- All environment variables read by the application appear in `.env.example`; only the password’s documented default conflicts.
- TypeScript, CommonJS, Express 5, `tsx`, package metadata, lockfile entries, and `tsconfig.json` agree.
- Hardcoded authentication remains an explicitly documented demo constraint and was not classified as a defect.
- Completed MySQL tasks have corresponding implementation and dependency evidence.

## Validation and limitations

- `npm exec tsc -- --noEmit` — **passed**
- `git status --short` — **clean at audit completion**
- No test or OpenAPI-validation script is configured.
- Live MySQL startup, persistence, schema compatibility, seeding, and cascade behavior were not exercised because that could mutate database state.
- Actual `.env` secret values were intentionally not inspected.
