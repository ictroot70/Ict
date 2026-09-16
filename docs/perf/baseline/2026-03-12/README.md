# PERF Baseline Capture (2026-03-12)

## Scope

- Build baseline: `ANALYZE=true pnpm build`
- Lighthouse JSON + assets (`--save-assets`) for:
- `/`
- `/profile/[id]` (captured as `/profile/1`)

## Current Metrics (Desktop Lighthouse)

| Route                          | Perf |    FCP |    LCP |  TBT |    CLS | Speed Index |    TTI |
| ------------------------------ | ---: | -----: | -----: | ---: | -----: | ----------: | -----: |
| `/`                            |  100 | 0.38 s | 0.50 s | 0 ms | 0.0014 |      1.05 s | 0.50 s |
| `/profile/[id]` (`/profile/1`) |   99 | 0.37 s | 0.86 s | 0 ms | 0.0000 |      0.90 s | 0.86 s |

## Artifacts

- Analyze build log: `analyze-build.log`
- Bundle analyzer reports:
- `client.html`
- `nodejs.html`
- `edge.html`
- Lighthouse reports:
- `lighthouse/home.report.json.gz`
- `lighthouse/profile-1.report.json.gz`
- `lighthouse/lighthouse-metrics.json` (quick readable summary)
- Network snapshots (DevTools logs):
- `lighthouse/home.network.devtoolslog.json.gz`
- `lighthouse/profile-1.network.devtoolslog.json.gz`
- Traces:
- `lighthouse/home.report-0.trace.json.gz`
- `lighthouse/profile-1.report-0.trace.json.gz`
- Network summary:
- `network-summary.json`

## Notes

- `ANALYZE=true pnpm build` required network access to fetch `next/font` (Inter).
- Quality gate fix applied before capture: icon re-export switched to `@ictroot/ui-kit/icons` in `src/shared/ui/SVGComponents/index.ts`.
