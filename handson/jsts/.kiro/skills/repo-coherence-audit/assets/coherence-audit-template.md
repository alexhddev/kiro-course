# Repository Coherence Audit

**Audit date:** YYYY-MM-DD  
**Workspace:** `<workspace name or root>`  
**Result:** `<Aligned | Findings present | Inconclusive>`

## Executive summary

Summarize overall coherence, the highest-risk disagreement, and major limitations in a short paragraph.

| Severity | Count |
|---|---:|
| Critical | 0 |
| High | 0 |
| Medium | 0 |
| Low | 0 |
| Info | 0 |

## Coverage

| Area | Artifacts checked | Status |
|---|---|---|
| Implementation | `<paths>` | `<Checked | Partial | Not applicable>` |
| Documentation | `<paths>` | `<Checked | Partial | Not applicable>` |
| Steering | `<paths>` | `<Checked | Partial | Not applicable>` |
| Specs | `<paths>` | `<Checked | Partial | Not applicable>` |
| Configuration | `<paths>` | `<Checked | Partial | Not applicable>` |

## Findings

List findings from highest to lowest severity. If there are none, write: `No verified coherence findings.`

### [CA-001] `<Severity>` — `<concise title>`

- **Areas:** `<implementation ↔ documentation, steering ↔ configuration, etc.>`
- **Conflicting claims:** `<what each artifact says or implies>`
- **Evidence:**
  - `<relative/path:line>` — `<relevant observed fact, paraphrased>`
  - `<relative/path:line>` — `<conflicting observed fact, paraphrased>`
- **Impact:** `<specific consequence>`
- **Recommended reconciliation:** `<smallest reasonable change or decision needed>`
- **Confidence:** `<High | Medium | Low>`

Repeat for each finding and remove this instruction.

## Verified alignments

List important claims checked and found consistent, with concise path references. These are verification results, not general praise.

- `<claim>` — `<relative/path:line>` agrees with `<relative/path:line>`

## Coverage gaps and uncertainties

List anything that could not be verified and why. If none, write: `No material coverage gaps.`

- `<unverified area>` — `<reason and what evidence would resolve it>`

## Recommended next actions

Provide a short, severity-ordered set of actions. Do not implement them as part of the audit.

1. `<action tied to finding ID>`
