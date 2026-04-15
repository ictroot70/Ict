# Post-Start Lighthouse Follow-up (Production Build)

Дата: 2026-03-14  
Режим замера: `pnpm build && pnpm start`, Lighthouse Desktop (Chromium 145)

## 1) Контекст

После запуска в production-режиме выполнены дополнительные ручные замеры для проверки «чистого» сигнала (без dev-bundle и hot-reload искажений).

Проверенные URL:

- `http://localhost:3000/`
- `http://localhost:3000/profile/71?postId=1737&from=profile`
- `http://localhost:3000/profile/71?action=create`

## 2) Результаты (сводно)

| URL                                    | Perf | A11y |  BP | SEO |  FCP |  LCP | TBT |   CLS |
| -------------------------------------- | ---: | ---: | --: | --: | ---: | ---: | --: | ----: |
| `/`                                    |  100 |   94 |  96 | 100 | 0.3s | 0.6s | 0ms | 0.002 |
| `/profile/71?postId=1737&from=profile` |   97 |   90 |  96 | 100 | 0.4s | 1.1s | 0ms | 0.048 |
| `/profile/71?action=create`            |   96 |   90 |  96 | 100 | 0.3s | 0.9s | 0ms | 0.047 |

Вывод:

- perf-профиль после оптимизаций стабильно высокий (`96-100`), `TBT = 0ms` на всех трёх сценариях;
- остаются локальные улучшения по `CLS` и `Accessibility`.

## 3) Найденные проблемы и зоны улучшения

## 3.1 CLS выше внутреннего budget на profile-modal сценариях

- Наблюдение:
  - `CLS = 0.048` (`postId` deeplink)
  - `CLS = 0.047` (`action=create`)
- Статус: не блокирует CWV (`< 0.1`), но выше внутреннего порога команды `0.03`.

## 3.2 LCP request discovery: нужен `fetchpriority=high` в critical modal path

- Lighthouse помечает LCP image в modal-сценарии как `fetchpriority=auto`.
- Текущая точка: [ViewModePhotoSection.tsx](/Users/sem/inkubator/stz/instagramm/src/entities/posts/ui/PostModal/ViewMode/ViewModePhotoSection/ViewModePhotoSection.tsx:33) использует `IMAGE_LOADING_STRATEGY.default`.
- Потенциальное улучшение: в deep-link открытии поста (`?postId=`) переключать на `IMAGE_LOADING_STRATEGY.lcp`.

## 3.3 Accessibility: missing accessible names

1. Header language select trigger (кнопка без имени)  
   Точка использования: [LanguageSelect.tsx](/Users/sem/inkubator/stz/instagramm/src/widgets/Header/components/LanguageSelect/LanguageSelect.tsx:29)

2. ViewMode action icon buttons без `aria-label`  
   Точка: [ViewModePostFooter.tsx](/Users/sem/inkubator/stz/instagramm/src/entities/posts/ui/PostModal/ViewMode/ViewModePostFooter/ViewModePostFooter.tsx:58)

3. Outside close button в modal (`closeBtnOutside`)  
   Точка интеграции: [PostModal.tsx](/Users/sem/inkubator/stz/instagramm/src/entities/posts/ui/PostModal/PostModal.tsx:119)  
   Примечание: корневой control рендерится внутри `@ictroot/ui-kit`, вероятен package-level fix.

4. Hidden file input без явной label association  
   Точка: [UploadArea.tsx](/Users/sem/inkubator/stz/instagramm/src/shared/composites/UploadArea/UploadArea.tsx:44)

## 3.4 Accessibility: low contrast в modal view/create сценариях

- Фейлы зафиксированы для timestamp/secondary текстов и части кнопок в modal.
- Примеры стилевых точек: [ViewMode.module.scss](/Users/sem/inkubator/stz/instagramm/src/entities/posts/ui/PostModal/ViewMode/ViewMode.module.scss:100), [ViewMode.module.scss](/Users/sem/inkubator/stz/instagramm/src/entities/posts/ui/PostModal/ViewMode/ViewMode.module.scss:180)

## 3.5 Best Practices: console 401 на `/me` в гостевом сценарии

- Симптом: Lighthouse фиксирует browser error (`401 Unauthorized`).
- Вероятно ожидаемое поведение для guest flow, но шумит в `Best Practices`.

## 4) Приоритеты follow-up

1. `P2` — A11y labels для action-кнопок (`ViewModePostFooter`, language select trigger contract, upload input association).
2. `P2` — Контраст текста/кнопок в create/view modal сценариях.
3. `P3` — Точечный CLS-tuning для profile modal flows (цель: вернуться к `<= 0.03` внутреннего бюджета).
4. `P3` — Guest `/me` error-handling hygiene (убрать шум 401 из консоли при ожидаемом сценарии).
5. `P3` — LCP-priority переключение для modal deep-link image.

## 5) Решение для Epic

Данные post-start проверки подтверждают, что perf-цели Epic достигнуты.  
Найденные пункты относятся к polish/follow-up и не блокируют закрытие Epic.
