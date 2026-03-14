# P1 Verification & Gate Decision (2026-03-14)

## Scope
- Baseline reference: `docs/perf/baseline/2026-03-12`
- Post-P1 capture:
- `ANALYZE=true pnpm build`
- Lighthouse Desktop (`--preset=desktop --save-assets`) for:
- `/`
- `/profile/1` (as sample for `/profile/[id]`)

## Baseline vs Post-P1

### 1) Analyzer (First Load JS)

| Route | Baseline | Post-P1 | Delta |
|---|---:|---:|---:|
| `/` | 249 kB | 241 kB | `-8 kB` |
| `/(.)create` | 376 kB | 369 kB | `-7 kB` |
| `/create` | 376 kB | 369 kB | `-7 kB` |
| `/auth/login` | 287 kB | 280 kB | `-7 kB` |
| shared | 102 kB | 103 kB | `+1 kB` |

### 2) Lighthouse Desktop

| Route | Perf | LCP | TBT | CLS | Requests |
|---|---:|---:|---:|---:|---:|
| `/` baseline | 100 | 0.50 s | 0 ms | 0.0014 | 53 |
| `/` post-P1 | 100 | 0.59 s | 0 ms | 0.0020 | 45 |
| `/profile/[id]` baseline | 99 | 0.86 s | 0 ms | 0.0000 | 40 |
| `/profile/[id]` post-P1 | 99 | 0.82 s | 0 ms | 0.0013 | 38 |

### 3) Network payload

| Route | Transfer KB baseline | Transfer KB post-P1 | Delta | Requests delta |
|---|---:|---:|---:|---:|
| `/` | 948.22 | 719.06 | `-229.16` | `-8` |
| `/profile/[id]` | 760.15 | 688.37 | `-71.78` | `-2` |

## Thresholds (for P1b gate)

Source: `scripts/check-lighthouse-budgets.mjs`

- `/`:
- `performance >= 95`
- `LCP <= 1.2s`
- `TBT <= 150ms`
- `CLS <= 0.03`
- `/profile/[id]`:
- `performance >= 95`
- `LCP <= 1.6s`
- `TBT <= 150ms`
- `CLS <= 0.03`

Post-P1 result:
- `/`: PASS (100, 0.59s, 0ms, 0.002)
- `/profile/[id]`: PASS (99, 0.82s, 0ms, 0.0013)

## Gate Decision

- **P1b нужен?**: **Нет**
- Основание:
- Целевые роуты получили снижение First Load JS (`/`, `/create`, `/auth/login`, `/(.)create`)
- Lighthouse пороги для decision-гейта пройдены на обеих контрольных страницах
- Сетевой payload и количество запросов: уменьшились

## Artifacts
- Build log: `analyze-build.log`
- Analyzer reports:
- `client.html`
- `nodejs.html`
- `edge.html`
- Lighthouse reports:
- `lighthouse/home.report.json.gz`
- `lighthouse/profile-1.report.json.gz`
- `lighthouse/lighthouse-metrics.json`
- `lighthouse/home.network.devtoolslog.json.gz`
- `lighthouse/profile-1.network.devtoolslog.json.gz`
- Traces:
- `lighthouse/home.report-0.trace.json.gz`
- `lighthouse/profile-1.report-0.trace.json.gz`
- Machine-readable comparison:
- `baseline-vs-post-p1.json`
- Network summary:
- `network-summary.json`
