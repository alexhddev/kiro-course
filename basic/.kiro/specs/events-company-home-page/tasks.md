# Implementation Plan: Events Company Home Page

## Overview

This plan converts the simple home page design into a series of implementation tasks. The page will replace the existing Vite starter content in `App.tsx` with four main sections: Hero, Services, Contact, and Footer.

## Tasks

- [x] 1. Create section components
  - [x] 1.1 Create HeroSection component
    - Create `src/components/HeroSection.tsx` with company name and tagline
    - Use semantic HTML with h1 for company name
    - _Requirements: 1.1, 1.2, 1.3, 5.1, 5.3_
  
  - [x] 1.2 Create ServicesSection component
    - Create `src/components/ServicesSection.tsx` with services list
    - Include "Our Services" heading and three event types
    - _Requirements: 2.1, 2.2, 2.3, 5.1, 5.3_
  
  - [x] 1.3 Create ContactSection component
    - Create `src/components/ContactSection.tsx` with email and phone
    - Use proper mailto: and tel: links
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 5.1, 5.3_
  
  - [x] 1.4 Create Footer component
    - Create `src/components/Footer.tsx` with copyright info
    - Use `new Date().getFullYear()` for dynamic year
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1_

- [x] 2. Update main App component
  - [x] 2.1 Replace App.tsx content with HomePage layout
    - Import all section components
    - Render sections in correct order
    - Remove existing Vite starter content
    - _Requirements: 1.3, 2.1, 3.1, 4.1, 5.1, 5.3_

- [x] 3. Add responsive styling
  - [x] 3.1 Create CSS for mobile-first responsive layout
    - Add styles to `src/App.css` or component files
    - Single column layout for < 768px
    - Appropriate layout for >= 768px
    - _Requirements: 6.1, 6.2_

- [x] 4. Add component tests
  - Test that each component renders expected content
  - Test responsive behavior
  - _Requirements: All_

- [x] 5. Final checkpoint
  - Ensure the page displays all required sections
  - Verify responsive behavior at different viewport sizes
  - Ask user if questions arise

## Notes

- Task marked with `*` is optional and can be skipped for faster delivery
- All components use TypeScript and follow React 19.2.8 conventions
- Existing Vite project structure is already set up
- CSS can leverage existing `index.css` or use component-specific styles
- No state management or data fetching required - all content is static

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["3.1"] },
    { "id": 3, "tasks": ["4"] }
  ]
}
```
