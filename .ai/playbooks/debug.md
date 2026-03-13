# Debug Playbook

## Steps

1. Локализовать слой сбоя (app/widgets/features/entities/shared).
2. Проверить контракты данных и ownership состояния.
3. Проверить Server/Client границу и runtime constraints.
4. Подтвердить root cause минимальным воспроизводимым сценарием.
5. Проверить влияние фикса на `locked` требования из `../contracts/product-requirements-lock.json`.
6. Спроектировать фикс без нарушения policy.
7. Если фикс затрагивает perf/auth flow — прогнать `pnpm run verify:full`.

## Checklist

- Root cause подтверждена, не гипотеза.
- Фикс не ломает границы слоёв.
- Нет добавленного tech debt без фиксации.
- Проверены quality-gates.
- Проверены contract checks для затронутых `locked` сценариев.
- Для perf/auth фиксов приложен результат `verify:full`.

## PR evidence

- Root cause summary.
- Scope фикса.
- Какие проверки запускались.
- Что с продуктовым контрактом (затронут/не затронут и как проверено).

## References

- `../policy.md`
- `../quality-gates.md`
- `../anti-patterns.md`
- `../contracts/product-requirements-lock.json`
