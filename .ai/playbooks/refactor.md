# Refactor Playbook

## Steps

1. Зафиксировать цель рефактора и границы (без изменения поведения).
2. Определить затрагиваемые слои и зависимости.
3. Выполнить изменения по model/api/ui с сохранением контрактов.
4. Проверить, что архитектурные инварианты не нарушены.
5. Проверить влияние на `locked` требования из `../contracts/product-requirements-lock.json`.
6. Прогнать quality-gates и contract checks.
7. Для PR/feature-веток прогнать `pnpm run verify:smart`.
8. Если `verify:smart` принял решение `run_full`, приложить результат `pnpm run verify:full`.

## Checklist

- Поведение не изменено.
- Границы фич и dependency direction сохранены.
- Нет новых anti-patterns.
- Изменения читаемы и поддерживаемы.
- `locked` продуктовые сценарии не регресснули.
- `verify:smart` зелёный.
- При `run_full` есть зелёный `verify:full` (browser smoke + Lighthouse budgets).

## PR evidence

- Что именно улучшено (readability/maintainability/perf).
- Почему это безопасно по функциональности.
- Результаты проверок.
- Подтверждение по продукт-контракту (что проверено и что не затронуто).

## References

- `../policy.md`
- `../quality-gates.md`
- `../anti-patterns.md`
- `../contracts/product-requirements-lock.json`
