---
name: repo-coherence-audit
description: Audit whether a repository's implementation, documentation, Kiro steering, specs, and configuration still agree, then write an evidence-based coherence-audit.md report. Use for repository coherence reviews, consistency audits, drift detection, stale documentation checks, spec-to-code verification, or configuration alignment checks.
---

# Repository Coherence Audit

Audit the current workspace for contradictions and drift across implementation, documentation, steering, specs, and configuration. The audit is read-only except for its report.

## Constraints

- Treat the directory containing `.kiro/` as the workspace root.
- Create or replace exactly one output file: `<workspace-root>/coherence-audit.md`.
- Do not modify implementation, documentation, steering, specs, configuration, tests, lockfiles, or generated files.
- Do not expose secret values. Refer only to secret names and locations.
- Do not install dependencies, start services, mutate external systems, or use network access solely for this audit.
- Distinguish verified contradictions from uncertainty. Never invent missing intent.

## Workflow

1. Establish scope
   - Inspect the repository tree and identify relevant implementation, documentation, `.kiro/steering/`, `.kiro/specs/`, and configuration files.
   - Exclude dependency, build-output, cache, vendored, and generated directories unless they are directly relevant to a claimed conflict.
   - Read `references/audit-checklist.md` and use every applicable section. Mark inapplicable areas in the report rather than forcing findings.

2. Determine authority and lifecycle
   - Record which artifacts define public contracts, developer instructions, product intent, runtime behavior, and planned work.
   - Treat explicit repository steering as governing instructions for code in its scope.
   - Treat public API/schema files as contracts when the repository identifies them as such.
   - Treat incomplete spec tasks and clearly future-tense roadmap text as planned behavior, not evidence that current implementation is defective.
   - When authority is ambiguous, report the conflict without declaring either side correct.

3. Perform bidirectional checks
   - Start from claims in documentation, steering, specs, and configuration and verify them against implementation.
   - Start from exposed implementation behavior and verify it is reflected in applicable contracts and documentation.
   - Compare duplicated facts such as names, paths, commands, versions, endpoints, schemas, defaults, environment variables, status values, and architectural boundaries.
   - Check internal agreement within each artifact category as well as agreement between categories.

4. Classify evidence
   - `Critical`: likely data loss, severe security exposure, or unusable primary behavior caused by the inconsistency.
   - `High`: public contract, required behavior, or operational setup materially disagrees with reality.
   - `Medium`: meaningful developer or user confusion, stale spec/docs, or violated repository convention.
   - `Low`: localized mismatch or maintenance risk with limited immediate impact.
   - `Info`: uncertainty, coverage gap, or non-actionable observation worth recording.
   - Combine duplicate symptoms into one root-cause finding. Do not inflate severity merely because several files repeat the same mismatch.

5. Write the report
   - Use `assets/coherence-audit-template.md` as the required structure.
   - Cite repository-relative paths and 1-based line numbers whenever practical.
   - For every finding, state the conflicting claims, evidence, impact, and smallest reasonable reconciliation.
   - Include verified alignments so the report shows what was checked, not only failures.
   - Include coverage gaps and reasons for anything that could not be verified.
   - If no contradictions are found, still create the report and explicitly state that result; do not claim the repository is universally correct.

6. Validate completion
   - Re-read `coherence-audit.md`.
   - Confirm all required report sections are present, severity counts match the detailed findings, each finding has evidence, and no secrets were copied.
   - Confirm no file other than `coherence-audit.md` was changed by the audit.

## Completion response

Briefly tell the user that the audit was written to `coherence-audit.md`, summarize finding counts by severity, and mention any important coverage limitation. Do not implement fixes unless the user separately requests them.
