# Technology Stack

## Core Technologies

- **React 19.2.8**: UI library
- **TypeScript 6.0.2**: Type-safe JavaScript
- **Vite 8.2.0**: Build tool and dev server with HMR
- **Vitest 4.1.11**: Testing framework with jsdom environment

## Development Tools

- **ESLint 10.8.0**: Linting with TypeScript ESLint and React plugins
- **@vitejs/plugin-react**: Uses Oxc for fast refresh
- **@testing-library/react 16.3.2**: Component testing utilities
- **@testing-library/jest-dom 7.0.1**: Custom matchers for DOM testing

## Common Commands

```bash
# Development
npm run dev              # Start dev server with HMR

# Building
npm run build            # Type check (tsc -b) + production build

# Quality
npm run lint             # Run ESLint checks
npm run test             # Run Vitest tests

# Preview
npm run preview          # Preview production build locally
```

## Configuration Files

- `vite.config.ts`: Vite configuration with Vitest integration
- `eslint.config.js`: Flat ESLint config with React and TypeScript rules
- `tsconfig.json`: Project references to app and node configs
- `tsconfig.app.json`: Application TypeScript configuration
- `tsconfig.node.json`: Node/build tooling TypeScript configuration

## Testing Setup

- Tests configured in `vite.config.ts` with globals enabled
- Setup file: `src/test/setup.ts`
- Environment: jsdom for DOM testing
- Test files: `*.test.tsx` co-located with components
