# Spec vs Plan Mode

Spec mode generates formal, detailed lifecycle documents (requirements, design, and implementation tasks), whereas Plan mode provides a faster, more conversational, read-only or planning-focused approach without creating the full formal specification paperwork.

## Key Differences: Spec vs. Plan

| Feature / Attribute | Spec Mode (Feature Specs) | Plan Mode (Plan Agent) |
|---------------------|---------------------------|------------------------|
| **Primary Purpose** | Formal, structured feature development with explicit approval gates. | Quick, conversational thinking and scoping before action. |
| **Artifact Generation** | Generates formal markdown files (requirements.md, design.md, tasks.md). | Does not generate formal requirements/design documents. |
| **Speed & Style** | Thorough, methodical, and structured for complex tasks. | Faster, lightweight, and interactive. |

## When to Use Which

**Use Kiro Specs when:**
- You are building complex, multi-component greenfield features
- You require explicit team documentation
- You want strict verification and correctness checking via Kiro Correctness Specs

**Use Kiro Plan Mode when:**
- You need to rapidly explore a codebase
- You want to talk through architectural ideas
- You need to map out an approach dynamically without committing to heavy documentation overhead