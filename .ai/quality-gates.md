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

## Smart check (PR/feature)

- Для PR и feature-веток обязательный гейт: `pnpm run verify:smart`.
- `verify:smart` всегда запускает `pnpm run ci:check`.
- Дальше `verify:smart` через `scripts/detect-impact.mjs` выбирает:
- `skip_full`, если нет влияния на `locked` зоны и infra-gates,
- `run_full`, если есть runtime-impact, infra-impact или uncertainty.
- Fail-safe правило: любой uncertainty => `run_full`.

## Full check (integration branch)

- Для интеграционной ветки `develop` обязателен `pnpm run verify:full` для каждого merge.
- `verify:full` включает:
- `pnpm run ci:check`
- `pnpm run test:e2e:smoke` (Chromium + Firefox + WebKit)
- `pnpm run perf:check` (Lighthouse Desktop Chromium)

## Tests status

- Контрактные регрессионные тесты включены: `pnpm test:contracts`.
- Browser smoke tests включены: `pnpm test:e2e:smoke`.
- Lighthouse budget check включён: `pnpm perf:check`.
- Источник контрактов: `.ai/contracts/product-requirements-lock.json`.
- `locked` требования считаются блокирующими: при падении contract-tests merge запрещён.

## Definition of Done

- Все требуемые gates для контекста задачи зелёные.
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
- Для PR с `verify:smart` в evidence обязательна секция `Smart impact decision`.
- Если `verify:smart` принял решение `run_full`, в evidence обязателен результат `verify:full`.

## Infrastructure constraints (educational project)

- `Jenkinsfile` и DevOps pipeline считаются external/read-only для frontend-команды.
- Если CI-инфраструктура использует другой package manager или другой gate-процесс, это фиксируется как external constraint, а не как нарушение frontend-команды.
- Для команды обязательны локальные quality-gates: `pnpm lint`, `pnpm typecheck`, `pnpm build` (или `pnpm run ci:check`).
