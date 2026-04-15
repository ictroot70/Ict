# Instagramm Web App

Instagram-like social network built with Next.js App Router, React and TypeScript.

## Stack

- Next.js 15 (App Router)
- React 19
- TypeScript (strict)
- Redux Toolkit + RTK Query
- pnpm

## Requirements

- Node.js LTS
- pnpm

## Quick start

```bash
pnpm install
pnpm dev
```


Git hooks are installed automatically on `pnpm install` (`prepare` script).
Manual reinstall:

```bash
pnpm run hooks:install
```

## API Mode

- Default mode (recommended): direct API URL (no proxy).
- Tunnel mode (optional): run `pnpm dev:proxy` to enable `/api/proxy` rewrites for local tunnel scenarios only.


## Canonical checks

Before PR/merge, run:

```bash
pnpm run ci:check
```

For refactor/performance/auth-flow changes, run extended checks:

```bash
pnpm run verify:smart
```

For integration branch `develop`, run full gate on merge:

```bash
pnpm run verify:full
```

Automatic gate selection (branch + changed files):

```bash
pnpm run verify:auto
```

Manual usage guide (who runs what and when):

- [`docs/quality-gates-runbook.md`](docs/quality-gates-runbook.md)
- [`docs/developer-check-sequence.md`](docs/developer-check-sequence.md)

## Governance model

- Architecture and invariants: `.ai/policy.md` (single source of truth)
- Quality gates: `.ai/quality-gates.md`
- Anti-patterns: `.ai/anti-patterns.md`
- Playbooks: `.ai/playbooks/*`
- Agent hints (without new rules): `AGENTS.md`

## Contribution

Contribution process and mandatory PR checklist:

- `CONTRIBUTING.md`
