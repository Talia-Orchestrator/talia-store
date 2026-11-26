---
name: impeccable-ui
description_en: "Apply Impeccable UI/UX design vocabulary, critique, audit, typography, layout, responsive behavior and design-system refinement through Talia's available tools."
description_it: "Applica il vocabolario di design UI/UX di Impeccable — critica, audit, tipografia, layout, comportamento responsive e raffinamento del design system — tramite i tool disponibili di Talia."
---

# Impeccable UI for Talia

Use this skill for UI/UX design, evaluation and refinement. Preserve the user's task, existing design system, requested fidelity, deliverable format and repository scope. Refer to the pinned upstream guidance as design source material and adapt its host-specific commands to the actual Talia tools.

## Start with the current task

1. Establish the product, audience, surface, requested operation and available source. Read existing PRODUCT.md, DESIGN.md and relevant UI code when present.
2. Read [upstream routing](upstream/reference/routing.md) and the single command reference relevant to the task. Read [upstream skill](upstream/SKILL.md) when a broader design workflow is needed.
3. Choose the surface mode through [new work](upstream/reference/new-work.md) or [operational UI](upstream/reference/operate.md). Ask for missing information only when it materially changes the requested result.

## Command references

| Task | Reference |
| --- | --- |
| Technical quality, accessibility, responsive and performance audit | [audit](upstream/reference/audit.md) |
| Scored UX and visual critique | [critique](upstream/reference/critique.md) |
| Focused final quality pass | [polish](upstream/reference/polish.md) |
| Typography and hierarchy | [typeset](upstream/reference/typeset.md) |
| Spacing, rhythm and layout | [layout](upstream/reference/layout.md) |
| Color and theming | [colorize](upstream/reference/colorize.md) |
| Adaptation to screens, input methods and platforms | [adapt](upstream/reference/adapt.md) |
| Simplification and information density | [distill](upstream/reference/distill.md) |
| Labels, instructions, errors and microcopy | [clarify](upstream/reference/clarify.md) |
| Loading, error, empty, permission and edge states | [harden](upstream/reference/harden.md) |
| Onboarding and first use | [onboard](upstream/reference/onboard.md) |
| Motion and reduced-motion behavior | [animate](upstream/reference/animate.md) |
| Design-system extraction and documentation | [extract](upstream/reference/extract.md), [document](upstream/reference/document.md) |
| Performance refinement | [optimize](upstream/reference/optimize.md) |
| Additional visual directions | [bolder](upstream/reference/bolder.md), [quieter](upstream/reference/quieter.md), [delight](upstream/reference/delight.md) |

## Talia tool mapping

- Use read_files, list_files and grep_files to inspect source and references. Resolve skill-relative documents with the read reference supplied by Talia.
- Use the host's available preview, browser and screenshot tools to examine the rendered interface. A viewport screenshot establishes layout evidence; keyboard, pointer and touch claims require exercising those interactions.
- For requested edits, use the host's available file-editing tools, preserve unrelated changes and run relevant project checks.
- Use bash or process_session for CLI work only when those tools and the resolved local runtime paths are available.
- Upstream `.agents/skills/impeccable` paths denote this package's upstream/ directory. Resolve them against the actual installed skill location. Keep the working directory at the target project. The included launcher is upstream/scripts/impeccable on POSIX and upstream/scripts/impeccable.cmd on Windows. The POSIX source can be invoked with sh when executable permissions are unavailable.
- The launchers are upstream sources with a pinned engine version and checksum metadata. They may download a compatible engine on first execution. Record the actual command, engine availability and outcome. If execution is unavailable, continue with source and rendered review and report which deterministic checks remain unexecuted.
- The helper definitions in upstream/agents/ are reference material. Use delegation only when the host actually exposes it. Otherwise perform the needed review steps sequentially.
- Automatic after-edit hooks and live-session browser connections depend on host support. Installing this skill does not activate those integrations.

## Completion

For an audit or critique, return prioritized findings with affected surfaces and evidence. For requested changes, deliver the revised UI and the checks actually performed. Distinguish source inspection, rendered checks, exercised interactions and deterministic CLI findings. Preserve measured results and identify unavailable checks in the delivery.
