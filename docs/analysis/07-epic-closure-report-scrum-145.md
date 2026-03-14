# Epic Closure Report — SCRUM-145 App-wide Performance Optimization

Дата: 2026-03-14  
Статус: `READY_TO_CLOSE`

## 1) Executive Summary

Цель Epic: снизить клиентский вес и сетевой overhead на ключевых маршрутах, подтвердить результат метриками и принять решение по follow-up этапам.

Итог:
- целевые оптимизации внедрены и верифицированы;
- контрольные Lighthouse budgets пройдены;
- по `P1b` принято решение **не запускать дополнительный этап**;
- отложенные направления формализованы отдельными follow-up/backlog задачами.

## 2) Метрики До/После

Источник сравнения: `docs/perf/post-p1/2026-03-14/baseline-vs-post-p1.json`  
Baseline: `docs/perf/baseline/2026-03-12`  
Post: `docs/perf/post-p1/2026-03-14`

### 2.1 First Load JS (Analyzer)

| Route | Baseline | Post-P1 | Delta |
|---|---:|---:|---:|
| `/` | 249 kB | 241 kB | `-8 kB` |
| `/(.)create` | 376 kB | 369 kB | `-7 kB` |
| `/create` | 376 kB | 369 kB | `-7 kB` |
| `/auth/login` | 287 kB | 280 kB | `-7 kB` |
| shared | 102 kB | 103 kB | `+1 kB` |

### 2.2 Lighthouse Desktop (контрольные страницы)

| Route | Perf | LCP | TBT | CLS |
|---|---:|---:|---:|---:|
| `/` baseline | 100 | 0.50 s | 0 ms | 0.0014 |
| `/` post-P1 | 100 | 0.59 s | 0 ms | 0.0020 |
| `/profile/[id]` baseline | 99 | 0.86 s | 0 ms | 0.0000 |
| `/profile/[id]` post-P1 | 99 | 0.82 s | 0 ms | 0.0013 |

### 2.3 Сеть (transfer + requests)

| Route | Transfer KB baseline | Transfer KB post-P1 | Delta | Requests delta |
|---|---:|---:|---:|---:|
| `/` | 948.22 | 719.06 | `-229.16` | `-8` |
| `/profile/[id]` | 760.15 | 688.37 | `-71.78` | `-2` |

## 3) Что сделано (TaskShifter traceability)

| Task | Статус | Что сделано | Репозиторный след |
|---|---|---|---|
| `SCRUM-146` | DONE | Baseline capture (analyzer + lighthouse + network) | `88ca26c`, `docs/perf/baseline/2026-03-12/*` |
| `SCRUM-147` | DONE | Image sizes/priority optimization | `9bea09b` |
| `SCRUM-148` | DONE | CLS stabilization (reserved image space) | `ecbb766` |
| `SCRUM-149` | DONE | Font path cleanup (`next/font`) | `a047458` |
| `SCRUM-150` | DONE | P0B readiness audit по `cookies()` usage | `0e93aea`, `docs/analysis/05-p0b-cookies-usage-audit.md` |
| `SCRUM-151` | DONE | Public cache / reliability track (закрыт в составе image infra пакета) | `5d03b88`, `efb650c` |
| `SCRUM-152` | DONE | Route/Auth-based code splitting | `e0f6ae3` |
| `SCRUM-153` | DONE | P1 verification + gate decision + post-metrics capture | `0564e47`, `docs/perf/post-p1/2026-03-14/*` |
| `SCRUM-155` | DONE | SafeImage fallback + image error telemetry | `5d03b88` |
| `SCRUM-156` | DONE | `_next/image` timeout/cdn/cache stabilization | `efb650c` |
| `SCRUM-157` | DONE | P2 feasibility audit для UI-kit CSS split | `32a242c`, `docs/analysis/06-p2-ui-kit-css-split-feasibility.md` |
| `SCRUM-158` | IN_PROGRESS | Epic closure report (текущий документ) | `docs/analysis/07-epic-closure-report-scrum-145.md` |

## 4) Что отложено / закрыто без реализации

1. `SCRUM-154 (P1b)` — **приостановлен/не запускался**: gate PASS, метрики не потребовали перехода к этапу.
2. Вынос auth-hint (`cookies()`) из root layout — **unsafe в текущем дизайне**, вынесено в отдельный refactor follow-up.
3. UI-kit CSS split на стороне consumer — **not feasible**, открыт backlog `BL-UIKIT-CSS-SPLIT-001` (нужен package-level CSS export split).

## 5) Quality Gates

Контрактный gate: `pnpm run ci:check` — `PASS`  
Примечание: в проекте есть lint/build warnings, но блокирующих ошибок нет.

## 6) Решение по дальнейшим шагам

1. Epic `SCRUM-145` — **рекомендуется к закрытию**.
2. Follow-up выполнять отдельными задачами:
- auth-hint root-layout refactor (после локализации consumers),
- `ui-kit` package-level CSS split (`BL-UIKIT-CSS-SPLIT-001`),
- точечные infra/perf улучшения при появлении новых регрессий в baseline.

## 7) Артефакты для приложения к Epic

1. Baseline: `docs/perf/baseline/2026-03-12/*`
2. Post-P1: `docs/perf/post-p1/2026-03-14/*`
3. P0B audit: `docs/analysis/05-p0b-cookies-usage-audit.md`
4. P2 feasibility: `docs/analysis/06-p2-ui-kit-css-split-feasibility.md`
