---
name: "review-checklist"
description: "Guide for conducting thorough code reviews with quality checklists. Use when reviewing pull requests or code changes."
license: "MIT"
metadata:
  author: "Alex"
  version: "1.0.0"
---

# Code Review Checklist

## Overview
This skill provides a structured approach to conducting thorough code reviews. It includes checklists for functionality, code quality, security, and performance considerations to ensure comprehensive review coverage.

## Prerequisites Checklist
- [ ] You have access to the code changes (diff, PR, or branch)
- [ ] You understand the feature or bug being addressed
- [ ] You have a local environment to test if needed

## Step-by-Step Guide

### 1. Understand the Context
Before diving into the code:
- Read the PR description or ticket
- Understand the problem being solved
- Review any related issues or documentation
- Check if tests are included

### 2. Review Code Quality

**Readability:**
- [ ] Code is clear and self-documenting
- [ ] Variable and function names are descriptive
- [ ] Complex logic has explanatory comments
- [ ] Code follows project style guidelines

**Structure:**
- [ ] Functions are focused and single-purpose
- [ ] No unnecessary code duplication
- [ ] Appropriate separation of concerns
- [ ] Follows project architecture patterns

### 3. Check Functionality

**Correctness:**
- [ ] Logic correctly implements requirements
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] No obvious bugs or logical errors

**Testing:**
- [ ] Tests are included for new functionality
- [ ] Tests cover happy path and edge cases
- [ ] Existing tests still pass
- [ ] Test names clearly describe what they verify

### 4. Security Review

- [ ] No hardcoded credentials or secrets
- [ ] User input is validated and sanitized
- [ ] SQL queries use parameterization
- [ ] Authentication/authorization is correct
- [ ] No sensitive data in logs

### 5. Performance Considerations

- [ ] No obvious performance bottlenecks
- [ ] Database queries are efficient
- [ ] Large datasets are paginated
- [ ] Caching is used appropriately
- [ ] No unnecessary API calls in loops

### 6. Provide Constructive Feedback

**Structure your comments:**
1. **Blocking issues** - Must be fixed (security, bugs, breaking changes)
2. **Suggestions** - Should be considered (improvements, optimizations)
3. **Nitpicks** - Optional (style preferences, minor cleanups)
4. **Praise** - Highlight good solutions and clean code

## Common Workflows

### Workflow: Quick Review (< 200 lines)
**Goal:** Fast review for small changes

1. Read the PR description
2. Scan the diff for obvious issues
3. Focus on changed logic and tests
4. Approve or request minor changes

### Workflow: Deep Review (> 200 lines)
**Goal:** Thorough review for significant changes

1. Check out the branch locally
2. Run tests and verify they pass
3. Review code section by section
4. Test manually if UI changes
5. Check for security and performance issues
6. Provide detailed feedback

## Best Practices

- **Be respectful** - Focus on code, not the person
- **Be specific** - Point to exact lines and suggest alternatives
- **Be timely** - Review within 24 hours when possible
- **Ask questions** - When logic is unclear, ask for clarification
- **Approve generously** - If changes work and meet standards, approve
- **Test manually** - Don't rely solely on tests for UI/UX changes

## Troubleshooting

### Error: "Too many changes to review"
**Cause:** PR is too large (> 500 lines)
**Solution:**
1. Ask the author to split into smaller PRs
2. Review in logical sections if splitting isn't possible
3. Focus on critical paths first

### Error: "Unclear what the code does"
**Cause:** Insufficient documentation or complex logic
**Solution:**
1. Request explanatory comments for complex sections
2. Ask the author to update the PR description
3. Suggest extracting complex logic into named functions
