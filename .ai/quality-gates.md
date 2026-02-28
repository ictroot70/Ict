# Quality Gates

## Canonical CI command
- Канонический CI-контракт: `pnpm run ci:check`.

## Must pass
Состав `ci:check` (обязательно и локально, и в CI):
- `pnpm lint` (ESLint CLI)
- `pnpm typecheck`
- `pnpm build`

## Tests status
- Текущее состояние: `not enforced yet` (реальный test runner/gate не стабилизирован).
- Заглушка формата "test ok" не считается финальным quality-gate состоянием.

## Definition of Done
- Все quality-gates зелёные.
- Не добавлены новые `any`.
- Не нарушены FSD dependency boundaries.
- Критические сценарии проверены вручную:
- auth,
- post upload/publish,
- edit profile,
- i18n language switch.

## Infrastructure constraints (educational project)
- `Jenkinsfile` и DevOps pipeline считаются external/read-only для frontend-команды.
- Если CI-инфраструктура использует другой package manager или другой gate-процесс, это фиксируется как external constraint, а не как нарушение frontend-команды.
- Для команды обязательны локальные quality-gates: `pnpm lint`, `pnpm typecheck`, `pnpm build` (или `pnpm run ci:check`).
