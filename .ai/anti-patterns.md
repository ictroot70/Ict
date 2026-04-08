# Anti-patterns

Запрещено:

- Business logic в UI/presentation components.
- State machine/таймеры в presentation components.
- Смешивание data fetching и UI concern-ов без orchestration слоя.
- Side effects в UI/RTK Query use-sites без orchestration.
- Hardcoded user-facing строки в обход i18n.
- Double source of truth для readiness/validation.
- Silent deviation from policy: нарушение policy без TODO/issue и без фиксации в PR.
- Для SSR/ISR (`revalidate`) возвращать error UI из server fetch-path при transient ошибках (`FETCH_ERROR`, `5xx`, timeout). Это приводит к "запеканию" ошибки в HTML/cache.
