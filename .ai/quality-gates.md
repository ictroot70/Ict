# Quality Gates

## Canonical CI command

- Канонический CI-контракт: `pnpm run ci:check`.

## Must pass

Состав `ci:check` (обязательно и локально, и в CI):

- `pnpm lint` (ESLint CLI)
- `pnpm typecheck`
- `pnpm contract:check`
- `pnpm test:contracts`
- `pnpm build`

## Full check (refactor/optimization)

- Для рефакторинга, performance-оптимизаций и изменений в `locked` критичных сценариях обязателен:
- `pnpm run verify:full`
- `verify:full` включает:
- `pnpm run ci:check`
- `pnpm run test:e2e:smoke`
- `pnpm run perf:check`

## Tests status

- Контрактные регрессионные тесты включены: `pnpm test:contracts`.
- Browser smoke tests включены: `pnpm test:e2e:smoke`.
- Lighthouse budget check включён: `pnpm perf:check`.
- Источник контрактов: `.ai/contracts/product-requirements-lock.json`.
- `locked` требования считаются блокирующими: при падении contract-tests merge запрещён.

## Definition of Done

- Все quality-gates зелёные.
- Не добавлены новые `any`.
- Не нарушены FSD dependency boundaries.
- Не нарушены `locked` требования из `.ai/contracts/product-requirements-lock.json`.
- Критические сценарии проверены вручную:
- auth,
- post upload/publish,
- edit profile,
- i18n language switch.

## Product contract guardrails

- Если меняется поведение `locked`-сценария, обязательны:
- обновление `.ai/contracts/product-requirements-lock.json`,
- обновление `tests/contracts/**`,
- секция `Product contract impact` в PR.
- Если задача `planned` или `optional_or_blocked`, перевод в `locked` допускается только после реализации и добавления автопроверок.
- Для оптимизаций/refactor PR в evidence обязательно прикладывать результат `verify:full`.

## Infrastructure constraints (educational project)

- `Jenkinsfile` и DevOps pipeline считаются external/read-only для frontend-команды.
- Если CI-инфраструктура использует другой package manager или другой gate-процесс, это фиксируется как external constraint, а не как нарушение frontend-команды.
- Для команды обязательны локальные quality-gates: `pnpm lint`, `pnpm typecheck`, `pnpm build` (или `pnpm run ci:check`).
