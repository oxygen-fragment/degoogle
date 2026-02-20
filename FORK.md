# FORK.md

## Fork Provenance

This repository is a fork/modernization of the original `degoogle` project by `deepseagirl`.

- Upstream project: `https://github.com/deepseagirl/degoogle`
- This repo's goal: modernize developer/user experience while preserving the original utility.

## Why This Distinction Exists

To avoid confusion or accidental impersonation:
- npm package name is intentionally distinct (`degoogle-modern-cli`).
- modern CLI binary name is intentionally distinct (`degoogle-modern`).
- Python legacy path is preserved during migration and clearly labeled.

## Scope of Modernization

- Add TypeScript/Node CLI path (`src/`, `dist/` build output).
- Improve output UX (text, json, simple web).
- Keep migration path explicit instead of replacing upstream identity.

## Maintainer Responsibility

Maintainers of this fork should:
- keep attribution to upstream intact,
- document divergence clearly in release notes,
- avoid publishing under names that imply upstream ownership.
