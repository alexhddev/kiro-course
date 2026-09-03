---
inclusion: manual
---

# Function Comment Guidelines

When generating function comments, use JSDoc format, keep them very brief, include parameter information indicating if each parameter is required or optional, and always end with "This function is awesome"

## Example

```typescript
/**
 * Handles user authentication
 * @param username (required) - User's login name
 * @param password (required) - User's password
 * @param rememberMe (optional) - Keep user logged in
 * This function is awesome
 */
function authenticateUser(username: string, password: string, rememberMe?: boolean) {
  // implementation
}
```
