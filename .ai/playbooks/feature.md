# Feature Playbook

## Steps

1. Уточнить цель фичи и границы ответственности.
2. Определить размещение по FSD.
3. Разделить model/api/ui перед реализацией.
4. Проверить Server vs Client decision для каждого entrypoint.
5. Сверить решение с `../policy.md` и `../quality-gates.md`.
6. Проверить влияние на `locked` требования из `../contracts/product-requirements-lock.json`.
7. Прогнать `pnpm run contract:check` и `pnpm run test:contracts`.
8. Для PR/feature-веток прогнать `pnpm run verify:smart`.
9. Если `verify:smart` принял решение `run_full`, приложить результат `pnpm run verify:full`.

## Checklist

- Границы фичи зафиксированы.
- UI остаётся presentation-only.
- Data-flow и ownership понятны.
- Нет нарушения dependency direction.
- `locked` продуктовые сценарии не нарушены.
- Приложен результат `verify:smart`.
- Если smart-gate выбрал `run_full`, приложен результат `verify:full`.

## PR evidence

- Краткое архитектурное обоснование.
- Какие gate-команды запускались.
- Какие риски/компромиссы приняты.
- Impact на продуктовый контракт (`locked`/`planned`/`optional_or_blocked`).

## References

- `../policy.md`
- `../quality-gates.md`
- `../anti-patterns.md`
- `../contracts/product-requirements-lock.json`
