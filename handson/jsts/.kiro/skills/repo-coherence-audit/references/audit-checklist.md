# Repository Coherence Checklist

Apply each relevant check in both directions: declared intent to observed behavior, and observed behavior to declared intent.

## Implementation

- Public entry points, routes, commands, exported APIs, schemas, and shared types
- Validation, error behavior, authorization, defaults, state transitions, and persistence behavior
- Module boundaries, data flow, naming, paths, and repository-specific layering rules
- Dependency usage versus declared dependencies and runtime assumptions
- Tests only as evidence of intended behavior; passing tests do not override stronger contracts

## Documentation

- README and contributor setup commands, prerequisites, ports, paths, and examples
- API specifications, schemas, examples, status codes, authentication, and error envelopes
- Architecture notes and code comments that make behavioral or structural claims
- Environment-variable documentation and example configuration
- Links and file references that point to renamed or removed artifacts

## Steering

- All applicable `.kiro/steering/*.md` files, including scoped or referenced guidance
- Technology, structure, product, style, validation, and workflow constraints
- Claims that steering makes about existing files, commands, or behavior
- Implementation that violates a governing instruction
- Steering that became stale after an intentional implementation change

## Specs

- Requirements and acceptance criteria versus implemented behavior
- Design decisions versus actual modules, interfaces, and data flow
- Task completion state versus evidence in the repository
- Completed tasks whose promised behavior is absent or materially different
- Implementation changes not reflected in an active, governing spec
- Planned or incomplete work incorrectly presented elsewhere as already available

## Configuration

- Package manifests and lockfiles; scripts, entry points, engines, module system, and versions
- Compiler, formatter, linter, test, build, and runtime configuration
- Environment examples versus variables actually read; compare names and defaults, never secret values
- Kiro settings, hooks, MCP configuration, and other checked-in workspace automation
- CI/CD, containers, deployment manifests, ignore files, and editor settings when present
- Configured paths or commands that no longer exist or cannot match repository structure

## Cross-cutting duplicated facts

Compare every repeated fact, especially:

- Endpoint paths, methods, request/response shapes, and status codes
- Enum values, lifecycle states, role names, and permissions
- File paths, module names, ports, command names, and default values
- Runtime and dependency versions
- Authentication requirements and token/header formats
- Data storage and durability claims
- Supported features, limitations, and production-readiness claims

## False-positive controls

- Separate current requirements from examples, historical notes, deprecated behavior, and future plans.
- Respect explicit demo, learning, or non-production limitations.
- Do not report formatting preferences unless a repository rule makes them mandatory.
- Do not infer a contradiction from absence alone when the artifact is outside the documented scope.
- If runtime verification would require credentials, services, or external mutation, record it as unverified instead.
- Report one root cause once and list all affected artifacts under it.
