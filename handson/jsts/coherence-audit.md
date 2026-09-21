# Repository Coherence Audit

**Audit date:** 2026-09-21  
**Workspace:** `/home/alex/work/kiro-course/handson/jsts`  
**Result:** Findings present

## Executive summary

The repository's route inventory, core CRUD behavior, lifecycle values, runtime stack, and most of the completed MySQL migration agree. The highest-risk drift is that governing product and structure steering still describes a self-contained in-memory service even though startup now requires and persists to MySQL. A second high-severity mismatch allows some contract-invalid order items to reach the data layer and be reported as `500` instead of the declared `400`. This was a static, read-only audit: the live database, real `.env`, and runtime responses were not inspected.

| Severity | Count |
|---|---:|
| Critical | 0 |
| High | 2 |
| Medium | 4 |
| Low | 0 |
| Info | 0 |

## Coverage

| Area | Artifacts checked | Status |
|---|---|---|
| Implementation | `src/api/server.ts`, `src/api/database.ts`, `src/api/db/pool.ts`, `src/model/Model.ts` | Partial — static inspection only |
| Documentation | `docs/openapi.yaml`, `.env.example`, code comments; no README present | Checked |
| Steering | `.kiro/steering/product.md`, `.kiro/steering/structure.md`, `.kiro/steering/tech.md` | Checked |
| Specs | `.kiro/specs/mysql-database-integration/{requirements.md,design.md,tasks.md,.config.kiro,tasks.meta.json}` | Checked |
| Configuration | `package.json`, `package-lock.json`, `tsconfig.json`, `.gitignore`, `.kiro/settings/mcp.json`, `.vscode/settings.json`, `awesome_connection.session.sql` | Partial — secrets and external tool semantics excluded |

## Findings

### [CA-001] High — Governing steering still describes the retired in-memory architecture

- **Areas:** steering ↔ implementation ↔ specs ↔ configuration
- **Conflicting claims:** Product and structure steering say menu and order data live in process memory and that no persistent database exists. The completed migration spec, source, dependency manifest, and startup path instead make MySQL the persistent store and a prerequisite for serving requests.
- **Evidence:**
  - `.kiro/steering/product.md:14` — describes in-memory, non-persistent storage as the current intentional design.
  - `.kiro/steering/structure.md:4-13,20-25` — omits `src/api/db/pool.ts` and says `database.ts` owns in-memory arrays.
  - `.kiro/specs/mysql-database-integration/tasks.md:9-90` — marks the MySQL dependency, pool, schema, SQL helpers, and startup bootstrap complete.
  - `src/api/database.ts:1-10,28-39,63-68,173-200,230-238` — uses the MySQL pool for menu and order operations rather than arrays.
  - `src/api/server.ts:377-390` — initializes and seeds MySQL before listening and exits on failure.
  - `package.json:5,25-28` — starts through `.env` and declares `mysql2`, while the steering setup section documents only `npm install` and `npm start` and no MySQL prerequisite (`.kiro/steering/tech.md:18-28`).
- **Impact:** Developers following governing instructions can expect a self-contained process, but a fresh environment needs database provisioning and environment setup; without a reachable MySQL store, the primary server never starts.
- **Recommended reconciliation:** Update product, structure, and tech steering to describe MySQL persistence, `src/api/db/pool.ts`, required environment variable names, database prerequisites, and startup-failure behavior. Keep the demo/non-production auth caveat separately.
- **Confidence:** High

### [CA-002] High — Some invalid order items are returned as internal server errors

- **Areas:** implementation ↔ API contract ↔ steering ↔ specs
- **Conflicting claims:** OpenAPI requires integer quantities of at least one, and both OpenAPI and steering classify invalid request data as `400`. The handlers accept positive fractional quantities and dereference item properties without first verifying that each item is an object. The data layer rejects fractions, and the route's broad catch maps that rejection—or a null-item property error—to `500`.
- **Evidence:**
  - `docs/openapi.yaml:340-349` — defines `quantity` as an integer with minimum `1`.
  - `docs/openapi.yaml:68-80,142-160` — declares `400` for invalid create and update data.
  - `.kiro/steering/tech.md:33-39` — requires handler validation and a `400` error envelope for invalid input.
  - `src/api/server.ts:128-145,229-246` — checks only that quantity is a positive number and accesses `item.name` before checking item object-ness.
  - `src/api/database.ts:87-95,181-189` — rejects non-integer quantity and null/invalid items.
  - `src/api/server.ts:161-166,266-271` — converts those thrown validation failures into `500` responses.
- **Impact:** Contract-invalid client payloads can be misreported as server failures, breaking status-code expectations and obscuring actionable validation feedback.
- **Recommended reconciliation:** Validate each item as a non-null object and require `Number.isInteger(quantity) && quantity > 0` in both handlers before calling the data layer; alternatively, use a typed validation error and map it to `400`.
- **Confidence:** High

### [CA-003] Medium — Authentication responses violate the mandatory response envelope

- **Areas:** steering ↔ implementation ↔ API contract
- **Conflicting claims:** Steering requires every success response to contain `success`, `data`, and `message`, and every error to contain `success`, `error`, and `message`. Login and admin responses omit required members. OpenAPI models the login token at the top level and does not mark common envelope properties as required, so it preserves or permits the implementation inconsistency instead of enforcing the governing convention.
- **Evidence:**
  - `.kiro/steering/tech.md:31-36` — defines mandatory success and error envelope shapes for all API responses.
  - `src/api/server.ts:326-333` — login success omits `data` and `message`; login failure omits `message`.
  - `src/api/server.ts:367-370` — admin success omits `data`.
  - `docs/openapi.yaml:304-323` — defines envelope properties but has no `required` lists.
  - `docs/openapi.yaml:408-417` — models login success as top-level `success` and `token`, also without required properties.
- **Impact:** Clients cannot rely on the repository's stated uniform response shape, and generated schema validation will not detect missing envelope fields.
- **Recommended reconciliation:** Normalize auth handlers and OpenAPI schemas to the standard envelopes, placing the token under `data`; otherwise, explicitly narrow the steering rule and document each exception.
- **Confidence:** High

### [CA-004] Medium — OpenAPI does not accurately describe invalid-input boundaries

- **Areas:** API contract ↔ implementation ↔ steering
- **Conflicting claims:** Handlers reject blank senders and empty contents, but OpenAPI does not encode those constraints. Login declares required credentials but maps missing credentials to `401` rather than validating them as a `400`, which is not documented. Order-by-ID operations document a `400` for a missing ID even though the required path parameter and Express route cannot invoke those handlers without a path segment.
- **Evidence:**
  - `docs/openapi.yaml:372-397` — create/update request schemas omit sender `minLength` and contents `minItems` constraints.
  - `src/api/server.ts:112-127,198-227` — rejects blank senders and empty contents with `400`.
  - `docs/openapi.yaml:198-222,396-406` — requires login fields but documents only `200` and `401`, with no invalid-request `400`.
  - `src/api/server.ts:326-332` — treats absent credentials as invalid credentials and returns `401` without a validation branch.
  - `docs/openapi.yaml:81-197,293-302` — requires the `{id}` path parameter while also documenting missing-ID `400` responses.
  - `src/api/server.ts:69-104,170-319` — missing-ID checks sit inside routes that require `:id`; there is no API fallback route after them.
- **Impact:** Schema-valid generated requests can still be rejected, login clients receive an undocumented validation classification, and consumers are promised a missing-path response that the declared route cannot produce.
- **Recommended reconciliation:** Add the actual sender/content constraints and login `400` behavior to both handlers and OpenAPI; remove unreachable missing-ID `400` claims unless explicit routes or fallback handling are added to produce them.
- **Confidence:** High

### [CA-005] Medium — The documented database-password fallback is internally contradictory

- **Areas:** implementation ↔ specs ↔ configuration ↔ code documentation
- **Conflicting claims:** The pool comment, completed design, and completed task specify a non-empty placeholder fallback for `DB_PASSWORD`; executable pool configuration and `.env.example` use an empty fallback. Requirement 1.2 requires one documented default for every connection setting.
- **Evidence:**
  - `.kiro/specs/mysql-database-integration/requirements.md:21-26` — requires a documented default when each database variable is unset.
  - `src/api/db/pool.ts:10-22` — its documentation table and executable fallback disagree for `DB_PASSWORD`.
  - `.kiro/specs/mysql-database-integration/design.md:39-65` — specifies the non-empty placeholder fallback in both example code and the defaults table.
  - `.kiro/specs/mysql-database-integration/tasks.md:16-21` — marks that same documented fallback complete.
  - `.env.example:5-9` — provides the database variable names and leaves the password entry empty, matching executable behavior rather than the spec text.
- **Impact:** Operators can configure different connection behavior depending on which repository artifact they trust, and a completed requirement has no single authoritative fallback.
- **Recommended reconciliation:** Choose one safe development fallback policy and make pool code, pool comments, design, task wording, and `.env.example` agree. Prefer requiring explicit credentials rather than documenting a realistic password.
- **Confidence:** High

### [CA-006] Medium — A completed helper-interface requirement is explicitly unmet

- **Areas:** requirements ↔ design ↔ tasks ↔ implementation
- **Conflicting claims:** Requirement 8.3 says daily-menu access must retain the prior access name. The design explicitly records an unavoidable rename from `dailyMenu` to `getDailyMenu`, while tasks claiming Requirement 8.3 are checked complete and the implementation uses the renamed accessor.
- **Evidence:**
  - `.kiro/specs/mysql-database-integration/requirements.md:104-108` — requires the same daily-menu access name as the former in-memory implementation.
  - `.kiro/specs/mysql-database-integration/design.md:68-84` — explicitly calls out the `dailyMenu` to `getDailyMenu` deviation.
  - `.kiro/specs/mysql-database-integration/tasks.md:38-43,76-82` — marks work attributed to Requirement 8.3 complete.
  - `src/api/database.ts:5-16` and `src/api/server.ts:4-5,52-58` — export, import, and call `getDailyMenu`.
- **Impact:** Requirement traceability and completion status overstate literal compliance, making later audits and maintenance decisions less reliable even though the async rename is technically reasonable.
- **Recommended reconciliation:** Amend Requirement 8.3 to permit an async accessor and record the accepted interface change; retain the completed task state only against that revised requirement.
- **Confidence:** High

## Verified alignments

- The entire exposed route surface is bidirectionally represented: eight route operations in `src/api/server.ts:52,69,106,170,275,326,337,351` correspond to all paths/methods in `docs/openapi.yaml:19-285`; neither side has an unmatched API operation.
- Core menu/order response behavior aligns: `src/api/server.ts:52-319` and `docs/openapi.yaml:19-197` agree on `200` menu/read/update/delete, `201` create, `404` missing orders, `500` unexpected data failures, and `data: null` on deletion.
- Lifecycle values agree across product intent, shared type, handler validation, data validation, SQL enum, and OpenAPI: `.kiro/steering/product.md:9`, `src/model/Model.ts:7-13`, `src/api/server.ts:208-217`, `src/api/database.ts:76-80`, `src/api/db/pool.ts:40-46`, and `docs/openapi.yaml:351-354` all use `RECEIVED`, `DELIVERING`, `DELIVERED`, and `CANCELED`.
- Most completed MySQL behavior is present: pool timeout and environment configuration (`src/api/db/pool.ts:18-26`), three-table schema and cascade (`src/api/db/pool.ts:29-58`), independently guarded seed operations (`src/api/db/pool.ts:104-149`), SQL-backed helpers and not-found sentinels (`src/api/database.ts:28-57,63-169,230-241`), transactional writes (`src/api/database.ts:101-146,193-218`), and startup abort before listening (`src/api/server.ts:377-390`) agree with `.kiro/specs/mysql-database-integration/design.md:18-35,86-181`.
- Repository layering remains intact despite stale storage wording: `src/api/server.ts:3-5,57,81,154,185,250,289-299` delegates data access, `src/api/database.ts:1-3` owns SQL-facing helpers, `src/api/db/pool.ts:18-58` owns pool/schema setup, and domain shapes remain in `src/model/Model.ts:1-14`.
- Auth route security and status codes mostly agree: login issues the static demo token, protected access requires that token, and admin decodes the role (`src/api/server.ts:7-24,322-370`), matching product's non-production auth scope (`.kiro/steering/product.md:10-14`) and OpenAPI's route-specific `200`/`401`/`403` declarations (`docs/openapi.yaml:198-285`).
- Runtime/configuration basics agree: CommonJS, Express 5, direct `tsx` startup, and dependency declarations in `.kiro/steering/tech.md:3-16` match `package.json:5,14,20-28`, and the manifest dependency ranges match `package-lock.json:7-20`.
- `PORT` defaults to `3000` consistently in `.kiro/steering/tech.md:18-28`, `.env.example:1-2`, `src/api/server.ts:27`, and `docs/openapi.yaml:7-9`.
- Application database variable names align between `.env.example:4-9` and `src/api/db/pool.ts:18-22`; `.gitignore:1-2` excludes the real `.env`. Checked-in SQLTools connection fields in `.vscode/settings.json:8-15` also align with the non-password local connection assumptions.

## Coverage gaps and uncertainties

- The real `.env` was deliberately not opened. Its variable names and values remain unverified, and no secret value was copied into this report.
- No server, database, test suite, or network operation was run. Database reachability, actual schema/data state, startup success against local MySQL, and runtime response serialization therefore remain unverified.
- No README, tests, test script, CI/CD, container, deployment, formatter, linter, or hook configuration is present. Those checklist areas are inapplicable as artifact comparisons; their absence does not prove runtime correctness.
- `.kiro/settings/mcp.json:7-13` uses `MYSQL_*` names while the application uses `DB_*`. The external MCP package's accepted environment contract was not available locally, so interoperability is uncertain rather than a verified contradiction.
- Requirement 2.5 says a non-empty “store” receives no seed data (`.kiro/specs/mysql-database-integration/requirements.md:39-40`), while design and code guard menu and orders independently (`.kiro/specs/mysql-database-integration/design.md:129-132`, `src/api/db/pool.ts:112-149`). “Store” could mean each logical collection or the database globally, so intent is ambiguous.
- Express has no custom malformed-JSON or API fallback error handler after middleware/routes (`src/api/server.ts:30-390`). Whether every such framework-generated response violates the envelope rule was not runtime-tested and is not counted as a finding.
- Product text associates staff with order lookup/update, but neither implementation nor OpenAPI protects order routes. Because product steering explicitly limits token wording to protected/admin-only endpoints (`.kiro/steering/product.md:10-14`), staff-only order authorization is not clear enough to classify as a contradiction.

## Recommended next actions

1. **CA-001:** Update governing steering and setup guidance for the completed MySQL architecture and its prerequisites.
2. **CA-002:** Make handler item validation object-safe and integer-exact so all invalid order payloads return `400`.
3. **CA-003:** Decide whether the standard response envelope is universal, then align auth handlers and OpenAPI with that decision.
4. **CA-004:** Encode actual request constraints and reachable validation statuses in OpenAPI and handlers.
5. **CA-005:** Select one `DB_PASSWORD` fallback policy and reconcile implementation, examples, comments, design, and completed tasks without storing secrets.
6. **CA-006:** Revise Requirement 8.3 to record the accepted async accessor rename and restore accurate traceability.
