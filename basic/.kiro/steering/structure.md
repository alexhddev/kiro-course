# Project Structure

## Directory Organization

```
/
├── src/
│   ├── components/          # React components
│   │   ├── *.tsx           # Component implementations
│   │   ├── *.test.tsx      # Component tests (co-located)
│   │   └── index.ts        # Barrel exports
│   ├── assets/             # Images and static assets
│   ├── test/               # Test utilities and setup
│   ├── App.tsx             # Main app component
│   ├── App.test.tsx        # App component tests
│   ├── App.css             # App-level styles
│   ├── index.css           # Global styles and CSS variables
│   └── main.tsx            # Application entry point
├── public/                 # Static assets served as-is
├── dist/                   # Build output (gitignored)
├── docs/                   # Documentation
└── [config files]          # Root-level configuration
```

## Component Structure

### Component Files
- Components use function declarations with named exports
- Each component has a co-located test file: `ComponentName.test.tsx`
- Components import from `./components` via barrel exports in `index.ts`

### Component Pattern
```typescript
export function ComponentName() {
  return (
    <section className="component-name">
      {/* Component content */}
    </section>
  );
}
```

## Styling Conventions

- **Global styles**: `src/index.css` (CSS variables, base styles)
- **Component styles**: `src/App.css` (component-specific classes)
- **Mobile-first**: Base styles for mobile, media queries for desktop (`min-width: 768px`)
- **CSS variables**: Defined in `:root` for colors, fonts, spacing
- **Dark mode**: Automatic via `prefers-color-scheme: dark` media query

### CSS Class Naming
- Lowercase with hyphens: `.hero`, `.services`, `.contact`, `.footer`
- Modifier classes: `.tagline`, `.button-icon`
- Semantic structure: section classes match component purpose

## Testing Conventions

- Use Vitest with `describe`, `it`, `expect` pattern
- Import from `@testing-library/react` for rendering and queries
- Use `screen.getByRole()` for accessible queries
- Test semantic HTML and accessibility requirements
- Comment test requirements when applicable: `// Requirement X.X: description`

### Test Structure Example
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('describes expected behavior', () => {
    render(<ComponentName />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
```

## Import Conventions

- React imports: `import { Component } from 'react'`
- Component imports: Named imports from component files or barrel exports
- CSS imports: `import './Component.css'`
- Asset imports: `import imageName from './assets/image.png'`
- No file extensions for TS/TSX imports (handled by bundler)

## Code Style

- Use TypeScript strict mode
- Function components (no class components)
- Semantic HTML5 elements (`<section>`, `<header>`, `<footer>`)
- Appropriate heading hierarchy (single `<h1>`, then `<h2>`, etc.)
- Accessible markup with ARIA roles and labels where needed
