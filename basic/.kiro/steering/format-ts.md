---
inclusion: fileMatch
fileMatchPattern: ["**/*.ts", "**/*.tsx"]
---

# TypeScript Formatting Guidelines

## Naming Conventions

### Constants
- **Constants MUST be named in UPPER_SNAKE_CASE**
- This applies to all constant values that are truly immutable and reused
- Examples:
  - ✅ `const MAX_RETRY_COUNT = 3;`
  - ✅ `const API_BASE_URL = 'https://api.example.com';`
  - ✅ `const DEFAULT_TIMEOUT_MS = 5000;`
  - ❌ `const maxRetryCount = 3;`
  - ❌ `const apiBaseUrl = 'https://api.example.com';`

### Other Naming
- Variables and functions: camelCase
- Classes and interfaces: PascalCase
- Type aliases: PascalCase
- Enums: PascalCase for the enum name, UPPER_SNAKE_CASE for enum values