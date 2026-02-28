# Debug Playbook

## Steps
1. Локализовать слой сбоя (app/widgets/features/entities/shared).
2. Проверить контракты данных и ownership состояния.
3. Проверить Server/Client границу и runtime constraints.
4. Подтвердить root cause минимальным воспроизводимым сценарием.
5. Спроектировать фикс без нарушения policy.

## Checklist
- Root cause подтверждена, не гипотеза.
- Фикс не ломает границы слоёв.
- Нет добавленного tech debt без фиксации.
- Проверены quality-gates.

## PR evidence
- Root cause summary.
- Scope фикса.
- Какие проверки запускались.

## References
- `../policy.md`
- `../quality-gates.md`
- `../anti-patterns.md`
