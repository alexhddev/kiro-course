---
name: repository-coherence-audit
description: Audit the Awesome Pizza repository for contradictions and drift between implementation, OpenAPI, steering, specs, environment configuration, package metadata, and developer documentation. Use when checking repository coherence, stale docs, architecture drift, spec completion, configuration mismatches, or before and after broad cross-file changes.
---

# Repository coherence audit

Audit read-only by default. Report evidence before proposing or applying fixes, and distinguish confirmed contradictions from unverified assumptions.

## Workflow

1. Define the audit scope from the request. For a repository-wide audit, inspect `.kiro/steering/`, `.kiro/specs/`, `.kiro/skills/`, `src/`, `docs/openapi.yaml`, `.env.example`, `package.json`, `package-lock.json`, and `tsconfig.json`.
2. Treat executable code and configuration as evidence of current behavior, `docs/openapi.yaml` as the intended REST contract, specs as feature intent and completion records, and steering as persistent project guidance. Flag disagreements rather than silently choosing one source.
3. Trace each relevant claim across layers: product capabilities, project structure, domain types, MySQL schema and queries, Express routes and validation, API schemas and responses, environment variables, scripts, dependencies, and completed spec tasks.
4. Read `references/coherence-checklist.md` and run every applicable comparison.
5. Report findings first, ordered by severity. For each finding, include the conflicting claims with file paths, impact, recommended source of truth, and the smallest coherent correction. Also state which areas were checked and had no observed drift.
6. Do not classify intentional demo constraints—such as hardcoded auth—as defects when steering explicitly documents them. Do flag contradictory descriptions of those constraints.
7. If fixes are requested, update all affected surfaces together without changing runtime behavior merely to match stale documentation. Preserve layering and activate a more specific skill when the fix involves endpoint or database behavior.
8. Run the checks relevant to any applied fixes and state what could not be verified.

Keep the report concise. Do not redesign the project or create speculative requirements during an audit.
