# ДЗ10 — Messenger: декомпозиция для Jira и разработки

## 1. Кратко по этапу

Основа:

- оригинальное задание `WebSocket: Messenger`;
- Swagger/OpenAPI по Messenger;
- Figma-дизайн Messenger/Profile;
- текущий frontend-проект.

Главное решение по архитектуре:

- **на этом этапе делаем Messenger внутри текущего монолита**;
- microfrontend из оригинального задания считается **optional** и вынесен в отдельный блок ниже;
- основной результат этапа: текстовые, image и voice сообщения в Messenger.

Основные UC:

- `UC-1` — отправка текстового сообщения;
- `UC-2` — отправка изображения;
- `UC-3` — отправка голосового сообщения.

Распределение без microfrontend:

- если есть 3 разработчика — делим на 3 основные Jira-задачи по UC;
- если есть 5 разработчиков — лучше разделить этап на UI shell, data/socket foundation, text, image, voice;
- общие точки соприкосновения заранее фиксируются, чтобы разработчики не дублировали один и тот же composer, socket, model и message rendering.

## 1.1 Простыми словами: что означают технические термины

Этот блок нужен, чтобы PM и разработчики одинаково понимали термины из задач.

- `MessageComposer` — нижняя панель в чате, где пользователь пишет сообщение, выбирает картинку или записывает голос.
- `MessageBubble` — один блок сообщения в переписке. Свои сообщения справа и синие, чужие сообщения слева и серые.
- `MessageDraft` — то, что пользователь подготовил, но еще не отправил: текст, выбранная картинка или записанный голос.
- transport отправки зависит от типа: text отправляется через Socket.IO, image и voice — через отдельные REST multipart endpoints.
- `slot` / место расширения — заранее подготовленное место в общем composer, куда другой разработчик подключает image или voice, не создавая второй input.
- `adapter` — небольшая часть логики конкретного типа сообщения: image adapter отвечает за выбор/preview картинки, voice adapter отвечает за запись/preview голоса.
- `preview в списке диалогов` — короткий текст или индикатор последнего сообщения слева в списке чатов.
- `reorder диалога` — когда после нового сообщения чат поднимается вверх списка диалогов.

Пользователь этих терминов не видит. Это внутренние договоренности команды, чтобы пять разработчиков не сделали пять разных вариантов одного и того же Messenger.

## 2. Приоритеты

| Приоритет | Задача              | Почему                                                                                                         |
| --------- | ------------------- | -------------------------------------------------------------------------------------------------------------- |
| P0        | UC-1 Text messages  | Базовый Messenger flow: список чатов, диалог, socket, отправка, получение, статусы.                            |
| P1        | UC-2 Image messages | Использует тот же composer и chat screen, отправляет multipart через отдельный REST endpoint.                  |
| P1        | UC-3 Voice messages | Использует тот же composer и chat screen, отправляет multipart через отдельный REST endpoint.                  |
| Optional  | Microfrontend       | В оригинальном задании необязателен. Делать только если команда/PM реально выделяют на это отдельную capacity. |

Важное правило:

- UC-2 и UC-3 делаем в этом этапе, но они **не должны блокировать готовность UC-1**.
- Backend-контракты загрузки image/voice опубликованы; обе media-задачи должны быть закрыты end-to-end.

## 3. Что уже есть в проекте

Уже есть:

- routes:
  - `/messenger`;
  - `/messenger/[id]`;
- route constants:
  - `APP_ROUTES.MESSENGER.BASE`;
  - `APP_ROUTES.MESSENGER.DIALOGUE(userId)`;
- API route constants:
  - `API_ROUTES.MESSENGER.BASE`;
  - `API_ROUTES.MESSENGER.DIALOGUE(dialoguePartnerId)`;
  - `API_ROUTES.MESSENGER.DELETE_MESSAGE(id)`;
  - `API_ROUTES.MESSENGER.IMAGE(receiverId)`;
  - `API_ROUTES.MESSENGER.VOICE(receiverId)`;
- dependency `socket.io-client`;
- пример Socket.IO-подхода в notifications;
- кнопка `Send Message` на чужом профиле уже ведет в `/messenger/{profile.id}`;
- страницы Messenger сейчас являются заглушками.

Из этого следует:

- не создавать новые route constants;
- не создавать второй socket-клиент под image/voice;
- не создавать три разных composer/input компонента;
- расширять текущий монолитный frontend.

## 4. Swagger/WebSocket контракт

## 4.1 REST

### `GET /api/v1/messenger`

Получить список последних диалогов/сообщений.

Query:

- `cursor?: number`;
- `pageSize?: number`, default `12`;
- `searchName?: string`.

Ответ:

- `items: LastMessageViewDto[]`;
- pagination fields;
- `notReadCount`.

Использование:

- список чатов слева;
- поиск по username;
- preview последнего сообщения;
- unread count.

### `GET /api/v1/messenger/{dialoguePartnerId}`

Получить историю сообщений с конкретным пользователем.

Query:

- `cursor?: number`;
- `pageSize?: number`, default `12`;
- `searchName?: string`.

Использование:

- открытый чат;
- подгрузка старых сообщений;
- открытие чата после клика `Send Message` на профиле.

### `PUT /api/v1/messenger`

Обновить статус сообщений.

Body:

```json
{
  "ids": [1, 2, 3]
}
```

Использование:

- при открытии чата пометить входящие сообщения как прочитанные;
- обновить unread count.

### `DELETE /api/v1/messenger/{id}`

Есть в Swagger, но в текущих UC удаление сообщения не описано.

Рекомендация:

- не включать в основные задачи UC-1/UC-2/UC-3;
- заводить отдельно только если PM добавит это в scope.

### `POST /api/v1/messenger/{receiverId}/image`

Отправить image message через `multipart/form-data`.

Поля:

- `file` — обязательный PNG/JPEG, максимум `1 MB`;
- `message` — optional caption, максимум `1000` символов.

Успешный ответ `201`: сохраненный `MessageViewModel`.

Ошибки:

- `400` — invalid receiver/image/message;
- `401` — unauthorized;
- `404` — receiver not found;
- `413` — image больше `1 MB`;
- `429` — rate limit.

### `POST /api/v1/messenger/{receiverId}/voice`

Отправить voice message через `multipart/form-data`.

Поля:

- `file` — обязательный AAC/M4A/MP3/OGG/WAV/WebM;
- максимум `3 MB`;
- максимум `60 seconds`.

Успешный ответ `201`: сохраненный `MessageViewModel`.

Ошибки:

- `400` — invalid receiver/audio/duration;
- `401` — unauthorized;
- `404` — receiver not found;
- `413` — audio больше `3 MB`;
- `429` — rate limit.

## 4.2 Message model

Общие поля сообщения:

- `id`;
- `ownerId`;
- `receiverId`;
- `messageText: string | null`;
- `mediaContent: MediaContentViewModel | null`;
- `messageType`;
- `status`;
- `createdAt`;
- `updatedAt`.

`messageType`:

- `TEXT`;
- `IMAGE`;
- `VOICE`.

`status`:

- `SENT`;
- `RECEIVED`;
- `READ`.

`MediaContentViewModel`:

- `fileType: 'image' | 'voice'`;
- `fileUrl: string`;
- `fileSize: number`.

Важно:

- text отправляется через Socket.IO `receive-message`;
- image/voice отправляются через REST multipart;
- один Messenger socket принимает общий `MessageViewModel` для realtime-событий;
- live integration 2026-07-30 подтвердил: после REST media upload получатель получает `message-send` через тот же Messenger socket.

## 4.3 Socket.IO

WebSocket URL:

- `https://inctagram.work`.

Connection:

```ts
io('https://inctagram.work', {
  query: {
    accessToken: 'your_access_token_here',
  },
  transports: ['websocket'],
})
```

Events:

| Event             | Path              | Direction | Кто использует  | Что происходит                                                                                                                                                                    |
| ----------------- | ----------------- | --------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RECEIVE_MESSAGE` | `receive-message` | `emit`    | отправитель     | Отправляет text message на backend. Payload: `MessageSendRequest { message, receiverId }`. Image/voice через этот payload не отправляются.                                        |
| `RECEIVE_MESSAGE` | `receive-message` | `listen`  | отправитель     | Получает сохраненное text message после socket-отправки. Для image/voice отправитель использует `201 MessageViewModel` из REST response.                                          |
| `RECEIVE_MESSAGE` | `receive-message` | `listen`  | отправитель     | По документации должен получать обновленный статус после acknowledgement. Live integration 2026-07-30 не подтвердил `SENT -> RECEIVED`.                                           |
| `RECEIVE_MESSAGE` | `receive-message` | `listen`  | оба участника   | Получает обновленное сообщение после `UPDATE_MESSAGE`, если редактирование будет добавлено позже.                                                                                 |
| `MESSAGE_SEND`    | `message-send`    | `listen`  | получатель      | Получает новое входящее сообщение. Для text после обработки вызывает документированный acknowledgement callback. Media ACK заблокирован до уточнения backend DTO.                 |
| `UPDATE_MESSAGE`  | `update-message`  | `emit`    | автор сообщения | Отправляет запрос на редактирование сообщения. Результат обновления приходит не через `update-message`, а через `receive-message`. Optional, не входит в основной scope UC-1/2/3. |
| `MESSAGE_DELETED` | `message-deleted` | `listen`  | оба участника   | Получает id удаленного сообщения. Optional, не входит в основной scope UC-1/2/3.                                                                                                  |
| `ERROR`           | `error`           | `listen`  | все клиенты     | Получает ошибку WebSocket-операции. Нужно показать user-facing error и залогировать.                                                                                              |

Важно:

- `receive-message` перегружен: это и emit для отправки, и listen для подтверждения/статусов/результата update.
- image/voice создаются через REST; live integration подтвердил доставку получателю через `message-send` того же socket;
- отправителю после media REST response дополнительный `receive-message` не приходит, поэтому sender использует REST result;
- `update-message` не нужно слушать как основной канал результата редактирования; результат приходит через `receive-message`.
- `update-message` может эмитить только автор сообщения; если редактирование сообщений когда-нибудь войдет в scope, frontend должен проверять ownership до отправки события.
- В текущем ДЗ10 редактирование и удаление сообщений не входят в основной scope, но направление событий фиксируется сейчас, чтобы не заложить неправильный socket-contract.

Payload отправки:

```json
{
  "message": "string",
  "receiverId": 1
}
```

Acknowledgement для получателя:

- по WebSocket-документации получатель должен подтвердить получение сообщения через callback;
- пример из документации: `callback({ message: message, receiverId: 1 })`;
- этот callback нужен, чтобы backend мог подтвердить доставку и обновить статус сообщения у отправителя с `SENT` на `RECEIVED`;
- callback фактически передается backend в handler;
- live integration 2026-07-30 проверил четыре варианта payload: text/full message и receiver/owner id;
- ни один вариант не изменил статус: text/image/voice остались `SENT`, socket error не пришел;
- до уточнения backend-контракта frontend сохраняет документированный text callback и не изобретает nullable media acknowledgement payload.

Подтверждено live integration:

- получатель фактически получает `message-send`;
- media REST upload фактически вызывает socket delivery;
- один message создает одно recipient socket event;
- точный acknowledgement DTO и backend-обновление `SENT -> RECEIVED` остаются backend-blocker.

## 5. UI-контракт по Figma

## 5.1 Messenger main screen

Экран `/messenger`:

- общий layout приложения сохраняется;
- sidebar активирует пункт `Messenger`;
- заголовок страницы `Messenger`;
- слева список диалогов;
- над списком search input `Input search`;
- справа пустая область, если чат не выбран;
- empty helper: `Choose who you would like to talk to`.

Список диалогов:

- avatar;
- username;
- preview последнего сообщения;
- время/дата;
- selected state;
- scroll внутри списка;
- длинные username/message preview не ломают layout.

## 5.2 Chat screen

Экран `/messenger/{userId}`:

- слева остается список диалогов;
- справа открыт чат;
- header чата: avatar + username;
- входящие сообщения слева, серые;
- исходящие сообщения справа, синие;
- отображается время;
- у исходящих сообщений отображается статус;
- composer закреплен снизу.

## 5.3 Composer

Общий composer должен поддерживать все три UC:

- text input;
- image attachment preview;
- voice recording preview;
- disabled/pending/error states;
- button `Send message` для текста/image;
- button `Send voice` для voice.
- если нет текста, image preview и voice preview, кнопка отправки должна быть disabled.

Важно:

- composer должен быть один;
- Dev-2 и Dev-3 не должны создавать отдельный input для image/voice;
- image и voice подключаются как расширения общего composer.

## 5.4 Profile entry point

На чужом профиле:

- показывается кнопка `Send Message`;
- клик открывает `/messenger/{profile.id}`;
- если диалога еще нет в списке, чат все равно открывается по `profile.id`;
- после первого сообщения диалог появляется/поднимается в списке.

На своем профиле:

- `Send Message` не показывается.

## 6. Главная точка соприкосновения задач

Все три разработчика работают рядом, потому что у них общие:

- `MessageType`;
- message DTO;
- socket connection;
- общий прием и upsert `MessageViewModel`;
- `MessageComposer`;
- `MessageBubble`;
- список диалогов и preview последнего сообщения;
- обработка pending/error state.

Чтобы не было конфликтов:

- Dev-1 создает общий каркас Messenger, composer, socket и message rendering;
- Dev-2 добавляет image только через подготовленные точки расширения;
- Dev-3 добавляет voice только через подготовленные точки расширения;
- если Dev-2/Dev-3 нужно поменять общий contract, это делается маленьким отдельным PR и согласуется с Dev-1.

Простое правило для команды:

- **один socket**;
- **один composer**;
- **один message list**;
- **один message bubble component**;
- разные только body/adapter для `TEXT`, `IMAGE`, `VOICE`.

## 6.1 Рекомендации по FSD-структуре

Этот блок нужен, чтобы разработчики не разложили Messenger по разным местам и не начали дублировать socket/API/composer.

В проекте уже используется FSD-структура:

- `app` — только route pages и подключение готовых widgets/features;
- `widgets` — крупные блоки страницы;
- `features` — пользовательские действия и сценарии;
- `entities` — доменные данные, API, типы, базовые UI-компоненты сущности;
- `shared` — только переиспользуемые вещи без знания о Messenger.

### Что уже есть и что использовать

- `src/app/(protected)/messenger/page.tsx` и `src/app/(protected)/messenger/[id]/page.tsx` уже существуют, но сейчас это заглушки. Их нужно оставить тонкими route pages: они только подключают Messenger widget, без socket/API/business logic внутри.
- `src/shared/api/api-routes.ts` уже содержит `API_ROUTES.MESSENGER.BASE`, `API_ROUTES.MESSENGER.DIALOGUE`, `API_ROUTES.MESSENGER.DELETE_MESSAGE`. Новые строки endpoint-ов дублировать не нужно.
- `src/shared/types/messages/message.models.ts` уже содержит `MessageViewModel`, `LastMessageViewDto`, `UpdateMessagesStatusDto`. Перед использованием Dev-2 должен сверить эти типы со Swagger и не плодить второй набор таких же типов в другом месте.
- `src/features/notifications/model/useNotificationsSocket.ts` можно использовать как пример socket lifecycle: подключение, listeners, cleanup, runtime validation. Но Messenger socket должен быть отдельным доменным hook-ом, а не копией внутри каждого UC.
- `src/widgets/Sidebar/model/useLinkGroups.tsx` уже содержит ссылку на Messenger, отдельную навигацию для этого этапа создавать не нужно.

### Рекомендуемая структура файлов

```text
src/app/(protected)/messenger/
  page.tsx
  [id]/page.tsx

src/widgets/messenger/
  index.ts
  model/
    useMessengerPage.ts
  ui/
    MessengerPage.tsx
    MessengerLayout.tsx
    DialoguesList.tsx
    DialoguePanel.tsx
    MessageComposer.tsx

src/entities/messenger/
  index.ts
  api/
    messengerApi.ts
  model/
    messenger.types.ts
    messengerSocket.events.ts
    useMessengerSocket.ts
    messengerDraft.types.ts
  lib/
    mapMessageToDialoguePreview.ts
    validateIncomingMessagePayload.ts
    reorderDialogues.ts
    isOwnMessage.ts
  ui/
    MessageBubble.tsx
    DialogueListItem.tsx
    ImageMessageBody.tsx
    VoiceMessageBody.tsx

src/features/messenger/text-message/
  index.ts
  model/
    useTextMessageComposer.ts
  ui/
    TextMessageInput.tsx

src/features/messenger/image-message/
  index.ts
  model/
    useImageMessageDraft.ts
  ui/
    ImageAttachButton.tsx
    ImagePreview.tsx

src/features/messenger/voice-message/
  index.ts
  model/
    useVoiceMessageDraft.ts
  ui/
    VoiceRecordButton.tsx
    VoicePreview.tsx
```

Это не требование к точным названиям каждого файла. Главное требование: сохранить границы слоев и ownership.

### Где должна жить логика

`app/(protected)/messenger`:

- только маршруты;
- получает `params`, если нужен `dialoguePartnerId`;
- подключает `MessengerPage` из `widgets/messenger`;
- не содержит `socket.on`, `baseApi`, `fetch`, `useEffect` с бизнес-логикой.

`widgets/messenger`:

- собирает страницу из списка диалогов, окна чата и composer;
- хранит layout-логику: выбранный диалог, состояние пустого экрана, loading/error/empty state;
- подключает feature-слоты `text-message`, `image-message`, `voice-message`;
- может импортировать `features`, `entities`, `shared`;
- не создает собственный второй socket и не описывает REST endpoints.

`entities/messenger`:

- единый REST API через `baseApi.injectEndpoints`;
- единый Messenger socket hook;
- типы `MessageViewModel`, `MediaContentViewModel`, `LastMessageViewDto`, `MessageType`, `MessageStatus`, `MessageDraft`, `SendMessagePayload`;
- REST mutations `sendImageMessage` и `sendVoiceMessage`;
- event constants для Socket.IO;
- mapper для preview/reorder диалогов;
- runtime validation входящих socket payload;
- базовые UI-компоненты сущности: `MessageBubble`, `DialogueListItem`, body для image/voice, если они только отображают уже готовые данные;
- не импортирует `features` или `widgets`.

`features/messenger/text-message`:

- управляет текстовым input;
- блокирует `Send message`, если нет текста и нет attachment;
- очищает input после успешной отправки;
- собирает payload для `TEXT`;
- вызывает socket `sendTextMessage(payload)`;
- не создает socket и не реализует REST API.

`features/messenger/image-message`:

- открывает выбор изображения;
- проверяет лимит 1 MB;
- показывает preview и удаление preview;
- собирает payload для `IMAGE`;
- вызывает `sendImageMessage` через REST multipart;
- не меняет общий socket/API contract без согласования с владельцем foundation.

`features/messenger/voice-message`:

- запрашивает permission на микрофон;
- записывает voice до 1 минуты или 3 MB;
- показывает recording indicator;
- дает прослушать и удалить preview;
- собирает payload для `VOICE`;
- вызывает `sendVoiceMessage` через REST multipart;
- не создает отдельный socket flow.

`shared`:

- не должен становиться папкой `shared/messenger`;
- сюда можно выносить только реально общие вещи, которые не знают о Messenger, например generic file-size helper или generic time formatter;
- Messenger DTO, Messenger socket events и Messenger hooks должны жить в `entities/messenger`, а не в `shared`.

### Ownership по 5 разработчикам

- Dev-1 (`Messenger UI Shell`) работает в `src/app/(protected)/messenger`, `src/widgets/messenger`, `src/entities/messenger/ui`.
- Dev-2 (`Messenger Data + Socket Foundation`) работает в `src/entities/messenger/api`, `src/entities/messenger/model`, `src/entities/messenger/lib`, при необходимости в `src/shared/api/base-api.ts` для RTK Query tag types.
- Dev-3 (`Text Messages`) работает в `src/features/messenger/text-message` и подключается к `MessageComposer` через подготовленный slot/props.
- Dev-4 (`Image Messages`) работает в `src/features/messenger/image-message` и, если нужно только отображение готового сообщения, добавляет/расширяет `src/entities/messenger/ui/ImageMessageBody.tsx`.
- Dev-5 (`Voice Messages`) работает в `src/features/messenger/voice-message` и, если нужно только отображение готового сообщения, добавляет/расширяет `src/entities/messenger/ui/VoiceMessageBody.tsx`.

Dev-1 в этой схеме работает сразу с двумя FSD-слоями: `widgets/messenger` и `entities/messenger/ui`. Это нормально, потому что widget собирает экран, а entity UI отображает отдельные Messenger-сущности. Важно: `entities/messenger/ui` не должен импортировать ничего из `widgets`, `features` или `app`.

Если Dev-3/Dev-4/Dev-5 нужно изменить `MessageComposer`, `MessageDraft`, `MessageViewModel`, socket listener или `MessageBubble`, это общий contract. Такой PR должен быть маленьким и идти с approve от владельца UI Shell/Foundation.

### Ownership по 3 разработчикам

- Dev-1 делает `widgets/messenger`, `entities/messenger/api`, `entities/messenger/model`, `entities/messenger/lib`, базовый `MessageBubble`, `MessageComposer` и `features/messenger/text-message`.
- Dev-2 делает `features/messenger/image-message` и image rendering в `entities/messenger/ui`, если оно нужно.
- Dev-3 делает `features/messenger/voice-message` и voice rendering в `entities/messenger/ui`, если оно нужно.

В 3-dev варианте Dev-1 сильнее загружен, потому что он одновременно владеет UI shell, data/socket foundation и UC-1. Поэтому image/voice разработчики не должны создавать свои socket hooks, чтобы "не ждать Dev-1". Они используют общие media DTO и REST mutations, а realtime-получение подключают к единому Messenger socket.

### Что запрещено, чтобы не сломать FSD

- Не класть Messenger business logic в `app/(protected)/messenger/page.tsx` или `[id]/page.tsx`.
- Не создавать второй `baseApi` для Messenger. Нужно использовать текущий `baseApi.injectEndpoints`.
- Не создавать отдельный socket hook внутри `text-message`, `image-message` и `voice-message`.
- Не импортировать `features/messenger/*` из `entities/messenger/*`.
- Не делать deep-import во внутренние файлы слайса. Внешние слои должны импортировать Messenger API через public API: `entities/messenger/index.ts`, `features/messenger/text-message/index.ts`, `features/messenger/image-message/index.ts`, `features/messenger/voice-message/index.ts`.
- Не складывать все в `shared`, потому что Messenger — это доменная область, а не общая инфраструктура.
- Не делать три разных `MessageBubble` под `TEXT`, `IMAGE`, `VOICE`. Должен быть один общий bubble и разные body/rendering по `messageType`.
- Не делать три разных composer. Должен быть один `MessageComposer` с расширяемыми slots/props для image и voice.

## 7. Jira-задачи на 3 разработчиков

## TASK-10.1 — UC-1 Text Messenger + общий каркас

Owner: Dev-1
Priority: P0
Depends on: нет
Reviewers: Dev-2, Dev-3

### Цель

Реализовать обязательный текстовый Messenger flow и общий каркас, через который Dev-2 и Dev-3 смогут добавить image/voice без дублирования.

### Что сделать

Dev-1 реализует:

- страницу `/messenger`;
- страницу `/messenger/{userId}`;
- список диалогов;
- поиск диалогов по `searchName`;
- открытие чата из списка;
- открытие чата с профиля через `Send Message`;
- загрузку истории сообщений;
- общий `MessageComposer`;
- общий `MessageBubble`;
- socket send flow для text;
- REST mutations для image/voice;
- Socket.IO connection;
- документированный acknowledgement callback для входящих text messages;
- отправку text message;
- получение входящего text message;
- обновление last message preview в списке диалогов;
- обновление unread/read status;
- базовые loading/empty/error states.

### Acceptance Criteria

- пользователь открывает Messenger из sidebar;
- пользователь видит список диалогов;
- пользователь может найти диалог по username;
- пользователь может открыть чат;
- пользователь может открыть чат через `Send Message` на чужом профиле;
- история сообщений загружается из REST;
- для пустого/whitespace-only текста кнопка `Send message` disabled, если нет image/voice attachment;
- текстовое сообщение отправляется через WebSocket;
- отправленное сообщение появляется у отправителя без reload;
- получатель получает сообщение без reload;
- frontend вызывает документированный acknowledgement только для text; media acknowledgement ждет уточнения backend DTO;
- статус сообщения обновляется по backend-событию, если backend его присылает;
- unread count обновляется после открытия диалога;
- диалог с новым сообщением поднимается вверх списка;
- `MessageComposer` имеет точки расширения для image и voice;
- `MessageBubble` умеет принимать `messageType`;
- Dev-2 и Dev-3 могут подключить свои части без создания второго composer/socket.

### Что важно не делать

- не реализовывать image upload;
- не реализовывать voice recording;
- не делать отдельный microfrontend;
- не добавлять удаление сообщений, если PM не выделил это отдельно.

### Точки соприкосновения

Dev-1 должен передать Dev-2/Dev-3:

- типы сообщения;
- contract composer state;
- способ добавить attachment/voice preview;
- способ вызвать send flow;
- способ отрисовать body внутри `MessageBubble`;
- mapper preview для списка диалогов.

## TASK-10.2 — UC-2 Image messages

Owner: Dev-2
Priority: P1
Depends on: актуальные `MessageViewModel`, image REST mutation и общий composer image slot
Reviewers: Dev-1, Dev-3

### Цель

Добавить отправку изображения в Messenger через уже созданный общий composer и общий message rendering.

### Что сделать

Dev-2 реализует:

- image icon в composer;
- выбор изображения через file picker;
- client validation:
  - только image-файлы;
  - максимум `1 MB`;
- preview выбранного изображения перед отправкой;
- удаление preview через `X`;
- отправку image-only сообщения;
- отправку image + text сообщения;
- отправку через `POST /api/v1/messenger/{receiverId}/image`;
- отображение отправленного image message в чате;
- preview image message в списке диалогов;
- error state для неверного типа файла/слишком большого файла.

### Acceptance Criteria

- пользователь нажимает image icon и выбирает файл;
- файл больше `1 MB` не принимается;
- не-image файл не принимается;
- выбранное изображение видно в preview до отправки;
- preview можно удалить;
- после удаления изображение не отправляется;
- можно отправить только изображение без текста;
- можно отправить изображение с текстом;
- после успешной отправки изображение отображается в чате;
- список диалогов обновляет preview последнего сообщения;
- диалог с новым image message поднимается вверх списка;
- image logic не создает второй composer, socket или message list.

### Transport contract

- `POST /api/v1/messenger/{receiverId}/image`;
- `multipart/form-data`;
- обязательный `file`, optional `message` до `1000` символов;
- PNG/JPEG, максимум `1 MB`;
- ответ `201`: `MessageViewModel`;
- получатель получает общий `MessageViewModel` через единый Messenger socket — подтверждено live integration.

### Точки соприкосновения

Dev-2 трогает общие зоны только через contract Dev-1:

- `MessageComposer` image slot;
- `MessageDraft`;
- `MessageBubble` body для `IMAGE`;
- `toDialoguePreview(message)`;
- `sendImageMessage` REST mutation.

## TASK-10.3 — UC-3 Voice messages

Owner: Dev-3
Priority: P1
Depends on: актуальные `MessageViewModel`, voice REST mutation и общий composer voice slot
Reviewers: Dev-1, Dev-2

### Цель

Добавить голосовые сообщения в Messenger через уже созданный общий composer и общий message rendering.

### Что сделать

Dev-3 реализует:

- voice icon в composer;
- запрос microphone permission;
- старт/остановку записи;
- визуальный индикатор записи;
- ограничение:
  - максимум `1 minute`;
  - максимум `3 MB`;
- preview записи перед отправкой;
- play/pause preview;
- удаление preview через `X`;
- отправку voice message через `POST /api/v1/messenger/{receiverId}/voice`;
- отображение отправленного voice message в чате;
- play/pause у отправленного voice message;
- preview voice message в списке диалогов;
- error state для denied permission/слишком длинной записи/слишком большого файла.

### Acceptance Criteria

- пользователь нажимает voice icon;
- если permission denied, пользователь видит понятную ошибку;
- запись начинается только после permission;
- во время записи виден индикатор;
- запись автоматически останавливается на `1 minute`;
- запись больше `3 MB` не отправляется;
- перед отправкой запись можно прослушать;
- preview можно удалить;
- после удаления voice message не отправляется;
- после успешной отправки voice bubble отображается в чате;
- у voice bubble работает play/pause;
- список диалогов обновляет preview последнего сообщения;
- диалог с новым voice message поднимается вверх списка;
- voice logic не создает второй composer, socket или message list.

### Transport contract

- `POST /api/v1/messenger/{receiverId}/voice`;
- `multipart/form-data`;
- обязательный `file`;
- AAC/M4A/MP3/OGG/WAV/WebM, максимум `3 MB` и `60 seconds`;
- ответ `201`: `MessageViewModel`;
- получатель получает общий `MessageViewModel` через единый Messenger socket — подтверждено live integration.

### Точки соприкосновения

Dev-3 трогает общие зоны только через contract Dev-1:

- `MessageComposer` voice slot;
- `MessageDraft`;
- `MessageBubble` body для `VOICE`;
- `toDialoguePreview(message)`;
- `sendVoiceMessage` REST mutation.

## 8. Порядок разработки

## 8.1 Без microfrontend, 3 разработчика

Рекомендуемый порядок:

1. Dev-1 начинает `TASK-10.1` и сначала делает общий каркас:
   - routes/layout;
   - REST API;
   - socket;
   - message types;
   - `MessageComposer`;
   - `MessageBubble`.
2. Dev-2 и Dev-3 параллельно готовят свои локальные части:
   - Dev-2: image validation/preview;
   - Dev-3: voice recording/preview.
3. Когда общий composer/message model готов, Dev-2 и Dev-3 подключают свои adapters.
4. Dev-1 закрывает text end-to-end.
5. Dev-2 закрывает image end-to-end.
6. Dev-3 закрывает voice end-to-end.
7. Все трое проходят общий integration smoke.

Что нельзя делать параллельно:

- одновременно менять shell `MessageComposer` без согласования;
- одновременно менять `MessageDraft` без согласования;
- создавать отдельные socket/send flows под image и voice.

## 8.2 Если PM хочет больше параллельности

Если на этапе есть 5 разработчиков, лучше не держать весь общий каркас внутри `TASK-10.1`. В этом случае нужно перейти к варианту из раздела `9.1` и завести две полноценные Jira-задачи:

- `Messenger shared UI skeleton`;
- `Messenger socket/API foundation`.

Так Dev-1 отвечает за UI shell с mock-данными, Dev-2 отвечает за реальные API/socket/types, а Dev-3/4/5 параллельно делают text/image/voice.

## 9. Вариант с 5 разработчиками

Если команда хочет задействовать 5 разработчиков, есть два варианта.

## 9.1 Без microfrontend

Это реально сделать и это хороший вариант, если в этапе участвуют 5 разработчиков.

Главная идея:

- не вешать весь общий каркас на разработчика UC-1;
- отдельно выделить UI shell;
- отдельно выделить data/socket foundation;
- text/image/voice разработчики подключаются к этим готовым точкам.

Рекомендуемое распределение:

| Developer | Jira                               | Priority | Ответственность                                                                                                |
| --------- | ---------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| Dev-1     | Messenger UI Shell                 | P0       | Страница Messenger, список диалогов, поиск, chat layout, `MessageBubble`, `MessageComposer` shell с заглушками |
| Dev-2     | Messenger Data + Socket Foundation | P0       | REST API, Socket.IO, media DTO, text socket send, image/voice REST mutations, read status                      |
| Dev-3     | UC-1 Text Messages                 | P0       | Text input behavior, disabled send для пустого текста, отправка/получение text message, text preview           |
| Dev-4     | UC-2 Image Messages                | P1       | Image picker, validation, preview, delete, send image, image bubble                                            |
| Dev-5     | UC-3 Voice Messages                | P1       | Microphone, recording, preview, delete, send voice, voice bubble                                               |

Такой вариант лучше, чем 3 разработчика, если команда хочет быстрее стартовать параллельно: Dev-1 может собрать экран с моками, Dev-2 готовит реальные контракты, Dev-3/4/5 делают свои adapters.

## 9.1.1 Jira — Messenger UI Shell

Owner: Dev-1
Priority: P0
Depends on: нет
Reviewers: Dev-2, Dev-3

### Цель

Собрать внешний каркас Messenger по Figma, чтобы остальные разработчики могли подключить реальную логику без переписывания UI.

### Что увидит пользователь

- Пользователь открывает раздел Messenger и видит страницу как в Figma.
- Слева виден список чатов с аватарками, именами и последними сообщениями.
- Пользователь может ввести текст в поиск и выбрать чат.
- Справа отображается выбранный чат с сообщениями в виде bubble.
- Внизу видна панель ввода с иконками картинки и микрофона.

### Что сделать

- страница `/messenger`;
- страница `/messenger/{userId}`;
- общий layout: sidebar приложения + Messenger рабочая область;
- список диалогов слева;
- search input `Input search`;
- selected state для выбранного диалога;
- empty state справа: `Choose who you would like to talk to`;
- chat header: avatar + username;
- зона истории сообщений;
- входящие/исходящие bubble:
  - входящие слева, серые;
  - исходящие справа, синие;
- общий `MessageBubble`;
- общий `MessageComposer` shell;
- в composer сразу показать:
  - text input;
  - image icon;
  - voice icon;
  - место для image preview;
  - место для voice preview;
  - `Send message` / `Send voice` states;
- временные mock данные для списка диалогов и истории.

### Acceptance Criteria

- Messenger визуально соответствует Figma на desktop;
- список диалогов скроллится внутри своей области;
- search input визуально готов и может работать с mock/filter;
- можно выбрать mock-диалог;
- справа отображается mock-переписка;
- `MessageBubble` принимает тип сообщения и направление `incoming/outgoing`;
- `MessageComposer` имеет понятные props/slots для text/image/voice;
- UI shell не содержит реальную business logic отправки;
- моковые данные легко заменить на реальные данные из Dev-2.

### Точки соприкосновения

Dev-1 должен согласовать с Dev-2/3/4/5:

- props для списка диалогов;
- props для истории сообщений;
- props для `MessageBubble`;
- props/callbacks для `MessageComposer`;
- где отображаются image/voice preview.

## 9.1.2 Jira — Messenger Data + Socket Foundation

Owner: Dev-2
Priority: P0
Depends on: нет
Reviewers: Dev-1, Dev-3

### Цель

Подготовить общий data/socket foundation, через который остальные разработчики смогут реализовать text, image и voice.

Dev-2 не реализует пользовательские сценарии отправки text/image/voice целиком. Он делает базовый транспортный слой, типы и общие функции, чтобы Dev-3/4/5 могли подключить свои сценарии без второго socket/API слоя.

### Что увидит пользователь

- Список чатов и история сообщений будут загружаться не из mock-данных, а из backend.
- Новые сообщения смогут приходить без перезагрузки страницы.
- После открытия чата непрочитанные сообщения смогут стать прочитанными.
- Последнее сообщение в списке чатов будет обновляться после отправки/получения.

### Что сделать

- REST API для `GET /api/v1/messenger`;
- REST API для `GET /api/v1/messenger/{dialoguePartnerId}`;
- REST API для `PUT /api/v1/messenger`;
- REST mutation для `POST /api/v1/messenger/{receiverId}/image`;
- REST mutation для `POST /api/v1/messenger/{receiverId}/voice`;
- общие типы:
  - `MessageType`;
  - `MessageStatus`;
  - `MediaFileType`;
  - `MediaContentViewModel`;
  - `MessageViewModel`;
  - `LastMessageViewDto`;
  - `MessageDraft`;
  - `SendMessagePayload`;
- Socket.IO connection;
- events:
  - `receive-message`;
  - `message-send`;
  - `error`;
- документированный acknowledgement callback для text и явный backend-blocker для media/status;
- `sendTextMessage` через Socket.IO;
- `sendImageMessage` и `sendVoiceMessage` через REST multipart;
- update dialogue preview mapper;
- read/unread status update;
- runtime validation socket payload;
- cleanup listeners on unmount.

### Граница ответственности Dev-2

Dev-2 делает:

- API hooks/functions для списка диалогов;
- API hooks/functions для истории конкретного диалога;
- API function для read/unread status;
- один Socket.IO client/connection;
- общие WebSocket event constants;
- низкоуровневый `sendTextMessage(payload)` contract;
- media REST mutations без feature-specific UX;
- обработку входящих socket events;
- документированный acknowledgement callback для text и фиксацию media/status backend-blocker;
- mapper, который из нового сообщения обновляет preview и порядок диалогов;
- runtime guards для payload от backend;
- формат ошибок, который смогут показать UI-разработчики.

Dev-2 не делает:

- UI input для текста;
- image picker;
- image preview;
- microphone permission;
- voice recording;
- text/image/voice bubble body;
- бизнес-логику конкретного сценария: когда очищать input, когда показывать preview, как управлять recording state;
- отдельные хуки вида `useSendTextMessage`, `useSendImageMessage`, `useSendVoiceMessage`, если они содержат UX-логику конкретного UC.

Допустимые shared hooks/functions от Dev-2:

- `useMessengerDialogs`;
- `useMessengerHistory(dialoguePartnerId)`;
- `useMessengerSocket`;
- `sendTextMessage(payload)`;
- `sendImageMessage(payload)`;
- `sendVoiceMessage(payload)`;
- `markMessagesAsRead(ids)`;
- `mapMessageToDialoguePreview(message)`;
- `validateIncomingMessagePayload(payload)`.

Недопустимо для Dev-2:

- реализовать всю отправку text/image/voice end-to-end вместо Dev-3/4/5;
- принимать решение, как выглядит image/voice preview в UI;
- создавать отдельный socket flow под каждый тип сообщения.

Простая граница:

- Dev-2 отвечает за "как данные уходят/приходят".
- Dev-3/4/5 отвечают за "что пользователь делает на экране и какой payload передается в соответствующий transport contract".

### Acceptance Criteria

- Dev-1 может заменить mock dialogs/history на реальные query data;
- Dev-3 может отправлять text через общий Messenger socket;
- Dev-4 может отправлять image через готовую REST mutation;
- Dev-5 может отправлять voice через готовую REST mutation;
- socket не дублируется в feature-задачах;
- text acknowledgement вызывается по документированному payload; media acknowledgement не изобретается до уточнения backend DTO;
- статус `SENT -> RECEIVED` обновляется после backend-подтверждения, если backend присылает обновленное сообщение;
- все socket listeners очищаются;
- ошибки socket/API возвращаются в понятном формате.

### Точки соприкосновения

Dev-2 должен передать всем:

- готовые hooks/api functions;
- типы;
- event constants;
- отдельные transport contracts для text/image/voice;
- contract для обновления preview в списке диалогов.

Что остается другим разработчикам после Dev-2:

- Dev-3: подключить text input к socket send contract, disabled state, очистку input, text bubble behavior.
- Dev-4: подготовить image payload через picker/preview/validation и передать его в `sendImageMessage`.
- Dev-5: подготовить voice payload через recording/preview/validation и передать его в `sendVoiceMessage`.

## 9.1.2.1 Подготовительный PR — Media Contract Alignment

Перед стартом интеграции трех feature-задач изменения из обновленного Swagger должны быть в общей ветке этапа.

Scope:

- добавить `MediaFileType` и `MediaContentViewModel`;
- изменить `messageText` на `string | null`;
- добавить обязательный `mediaContent: MediaContentViewModel | null`;
- обновить runtime guard входящих socket payload;
- добавить `IMAGE(receiverId)` и `VOICE(receiverId)` в API routes;
- добавить `sendImageMessage` и `sendVoiceMessage` REST mutations;
- покрыть DTO, multipart request и runtime guard тестами.

Не входит:

- text input UX;
- image picker/preview;
- microphone/recording;
- feature-specific composer orchestration;
- предположение, что REST-to-socket broadcast уже проверен.

После merge этого PR Dev-3/4/5 обновляют свои ветки от общей ветки этапа и продолжают независимо.

## 9.1.3 Jira — UC-1 Text Messages

Owner: Dev-3
Priority: P0
Hard dependency: `MessageComposer`, `MessageBubble`, Messenger socket send contract
Soft dependency: полный Messenger UI Shell и полный Data/Socket Foundation
Reviewers: Dev-1, Dev-2

### Цель

Реализовать текстовые сообщения поверх готового UI shell и data/socket foundation.

### Что увидит пользователь

- Пользователь вводит текст внизу чата и отправляет его.
- Пустое сообщение отправить нельзя.
- Отправленное сообщение сразу появляется в переписке.
- Получатель видит новое сообщение без перезагрузки.
- Диалог с новым сообщением поднимается вверх списка.

### Что сделать

- подключить text input к `MessageComposer`;
- делать `Send message` disabled для пустого/whitespace-only текста;
- отправлять text через socket send contract;
- отображать pending/error state;
- очищать input только после успешной отправки;
- отображать text message через общий `MessageBubble`;
- обновлять preview последнего сообщения в списке диалогов;
- проверить вход с профиля через `Send Message`.

### Acceptance Criteria

- пользователь вводит текст и отправляет сообщение;
- для пустого/whitespace-only текста кнопка `Send message` disabled;
- двойной клик не создает дубль;
- сообщение появляется в чате без reload;
- получатель получает сообщение без reload;
- список диалогов обновляет preview;
- диалог с новым text message поднимается вверх списка;
- text-flow не содержит отдельный socket/composer.

## 9.1.4 Jira — UC-2 Image Messages

Owner: Dev-4
Priority: P1
Hard dependency: `MessageComposer` image slot, актуальный `MessageViewModel`, `sendImageMessage` REST mutation
Soft dependency: полный Messenger UI Shell и полный Data/Socket Foundation
Reviewers: Dev-1, Dev-2

### Цель

Добавить отправку изображений через общий Messenger composer.

### Что увидит пользователь

- Пользователь нажимает иконку картинки внизу чата.
- Выбирает изображение на устройстве.
- Видит preview картинки до отправки.
- Может удалить выбранную картинку до отправки.
- Может отправить только картинку или картинку с текстом.
- Отправленная картинка появляется в переписке.
- Диалог с новым image message поднимается вверх списка.

### Что сделать

- подключить image icon в общий `MessageComposer`;
- открыть file picker;
- принять только image-файлы;
- проверить ограничение `1 MB`;
- показать preview выбранной картинки;
- добавить удаление preview через `X`;
- отправить image-only сообщение;
- отправить image + text сообщение;
- отправить multipart через `POST /api/v1/messenger/{receiverId}/image`;
- отрисовать image message через общий `MessageBubble`;
- обновить preview последнего сообщения в списке диалогов;
- поднять диалог вверх списка после отправки/получения image message;
- показать ошибку для неверного формата или слишком большого файла.

### Acceptance Criteria

- пользователь может выбрать изображение через image icon;
- файл больше `1 MB` не принимается;
- не-image файл не принимается;
- выбранное изображение видно до отправки;
- preview можно удалить;
- после удаления изображение не отправляется;
- можно отправить только изображение без текста;
- можно отправить изображение с текстом;
- после успешной отправки изображение отображается в чате;
- список диалогов обновляет preview последнего сообщения;
- диалог с новым image message поднимается вверх списка;
- image-flow не содержит отдельный socket/composer/message list.

### Работает через общий контракт

- `MessageComposer` image area;
- общий `MessageDraft`;
- `sendImageMessage`;
- общий `MessageBubble`.

### Integration verification

- REST `201` возвращает `MessageViewModel`;
- sender upsert-ит REST result по `id`;
- recipient получает тот же message через `message-send` — подтверждено live;
- sender не получает дополнительный media socket event;
- recipient получает одно событие, дубль не создается.

## 9.1.5 Jira — UC-3 Voice Messages

Owner: Dev-5
Priority: P1
Hard dependency: `MessageComposer` voice slot, актуальный `MessageViewModel`, `sendVoiceMessage` REST mutation
Soft dependency: полный Messenger UI Shell и полный Data/Socket Foundation
Reviewers: Dev-1, Dev-2

### Цель

Добавить голосовые сообщения через общий Messenger composer.

### Что увидит пользователь

- Пользователь нажимает иконку микрофона внизу чата.
- Даёт разрешение на микрофон.
- Записывает голосовое сообщение.
- Видит запись перед отправкой и может ее прослушать.
- Может удалить запись до отправки.
- Отправленное voice-сообщение появляется в переписке с play/pause.
- Диалог с новым voice message поднимается вверх списка.

### Что сделать

- подключить voice icon в общий `MessageComposer`;
- запросить microphone permission;
- реализовать старт/остановку записи;
- показать visual indicator записи;
- ограничить запись:
  - максимум `1 minute`;
  - максимум `3 MB`;
- показать preview записи;
- добавить play/pause для preview;
- добавить удаление preview через `X`;
- отправить voice message через `POST /api/v1/messenger/{receiverId}/voice`;
- отрисовать voice message через общий `MessageBubble`;
- добавить play/pause у отправленного voice message;
- обновить preview последнего сообщения в списке диалогов;
- поднять диалог вверх списка после отправки/получения voice message;
- показать ошибки для denied permission, превышения duration или size.

### Acceptance Criteria

- пользователь может начать запись через voice icon;
- запись начинается только после разрешения на микрофон;
- если permission denied, пользователь видит понятную ошибку;
- во время записи виден индикатор;
- запись автоматически останавливается на `1 minute`;
- запись больше `3 MB` не отправляется;
- перед отправкой запись можно прослушать;
- preview можно удалить;
- после удаления voice message не отправляется;
- после успешной отправки voice bubble отображается в чате;
- у voice bubble работает play/pause;
- список диалогов обновляет preview последнего сообщения;
- диалог с новым voice message поднимается вверх списка;
- voice-flow не содержит отдельный socket/composer/message list.

### Работает через общий контракт

- `MessageComposer` voice area;
- общий `MessageDraft`;
- `sendVoiceMessage`;
- общий `MessageBubble`.

### Integration verification

- REST `201` возвращает `MessageViewModel`;
- sender upsert-ит REST result по `id`;
- recipient получает тот же message через `message-send` — подтверждено live;
- sender не получает дополнительный media socket event;
- recipient получает одно событие, дубль не создается;
- media acknowledgement остается backend-blocker и не должен блокировать отображение сообщения;
- duration после reload берется из audio metadata, потому что Swagger не возвращает duration/waveform.

## 9.1.6 Порядок работы на 5 разработчиков

1. Dev-1 и Dev-2 стартуют параллельно:
   - Dev-1 делает UI shell с моками;
   - Dev-2 делает API/socket/types.
2. Dev-3 стартует text flow после первых contracts от Dev-1/Dev-2.
3. Dev-4 и Dev-5 параллельно делают image/voice preview и validation.
4. Когда `MessageComposer`, media DTO и REST mutations готовы, Dev-4/Dev-5 подключают реальные adapters.
5. Финально все проходят общий smoke:
   - открыть Messenger;
   - найти диалог;
   - отправить text;
   - отправить image;
   - отправить voice;
   - проверить realtime-доставку media второму пользователю;
   - проверить отсутствие дублей после REST response и socket event;
   - проверить preview в списке;
   - проверить вход с профиля.

Что важно:

- Dev-1 не должен писать реальную socket/business logic;
- Dev-2 не должен верстать весь Messenger UI;
- Dev-3/4/5 не должны создавать свои composer/socket/message list;
- все изменения общего `MessageDraft`, `MessageViewModel`, transport contracts и `MessageBubble` согласуются между владельцами задач.

## 9.2 С microfrontend, optional

Если команда решит делать microfrontend уже сейчас, тогда этап можно разделить на 5 разработчиков более естественно.

Распределение:

- Dev-1: host integration в основном приложении;
- Dev-2: новый Messenger app/repository setup;
- Dev-3: UC-1 text внутри Messenger app;
- Dev-4: UC-2 image внутри Messenger app;
- Dev-5: UC-3 voice + integration/deploy smoke.

Что нужно сделать для microfrontend:

- создать отдельный repository/application для Messenger;
- настроить subdomain, например `messager.inctagram.io`;
- определить host app: основное приложение;
- договориться, как host передает auth/access token;
- договориться, кому принадлежит route `/messenger/*`;
- подключить общий UI-kit/design tokens;
- настроить локальную разработку host + messenger app;
- настроить deploy/rollback;
- проверить, что deep links `/messenger/{userId}` работают;
- проверить, что login/logout синхронизируются между host и messenger app.

Риски microfrontend:

- это отдельная инфраструктурная задача, не просто “перенести папку”;
- без готового примера/МК команда может потратить больше времени на setup, чем на сам Messenger;
- auth sharing и routing могут стать главными blockers;
- для учебного этапа это может быть слишком дорогим решением.

Рекомендация:

- **по умолчанию не делать microfrontend в ДЗ10**;
- оставить как optional spike/отдельный этап;
- если PM все-таки хочет microfrontend, сначала завести отдельную Jira-задачу `Messenger microfrontend spike`, а уже после ее результата планировать implementation.

## 10. Риски и вопросы

## 10.1 Вопросы к backend

- Какой точный DTO должен содержать acknowledgement callback?
- Почему callback не меняет `SENT -> RECEIVED` ни для text, ни для image/voice?
- Должен ли media acknowledgement содержать `messageId`, полный message или другой DTO?

Простыми словами, зачем эти вопросы нужны:

- без acknowledgement callback backend может не перевести сообщение из `SENT` в `RECEIVED`;
- realtime-доставка `message-send` уже подтверждена и от acknowledgement не зависит;
- sender должен использовать REST result для image/voice, потому что дополнительного socket event нет.

## 10.2 Риски разработки

- UC-2/UC-3 могут начать дублировать composer, если Dev-1 не даст общий contract.
- acknowledgement/status contract не работает по опубликованному примеру и требует backend fix/clarification.
- Nullable `messageText` и `mediaContent` должны одинаково обрабатываться REST, socket guard и UI.
- Без cleanup socket listeners возможны дубли входящих сообщений.
- Без общего preview mapper список диалогов будет по-разному отображать text/image/voice.
- Если начать microfrontend без подготовки, этап может застрять на инфраструктуре.

## 11. Definition of Done

Этап считается готовым, если:

- UC-1 text работает end-to-end;
- UC-2 image работает end-to-end через REST multipart;
- UC-3 voice работает end-to-end через REST multipart;
- получатель получает image/voice realtime через единый Messenger socket;
- REST response и socket event не создают дубликаты сообщений;
- acknowledgement переводит сообщение в `RECEIVED` либо задача статусов явно заблокирована подтвержденным backend-defect;
- нет второго socket client;
- нет второго composer;
- нет второго message list;
- `/messenger` и `/messenger/{userId}` соответствуют Figma;
- `Send Message` с профиля открывает чат;
- для пустого/whitespace-only текста кнопка `Send message` disabled, если нет image/voice attachment;
- image/voice preview можно удалить до отправки;
- ошибки показываются пользователю;
- `pnpm run ci:check` проходит.

## 12. Чеклист для PR review

Для каждого PR:

- PR не создает второй socket client;
- PR не создает отдельный composer под свою задачу;
- PR не создает отдельный message list/bubble shell;
- если меняется общий `MessageDraft`/`MessageType`/`MessageViewModel`/transport contract, это согласовано с другими разработчиками;
- PR, который меняет `MessageComposer`, `MessageDraft`, `MessageViewModel`, socket listener или `MessageBubble`, не мержится без approve от владельца общего contract:
  - в 3-dev варианте это Dev-1;
  - в 5-dev варианте это Dev-1 для UI contract и Dev-2 для data/socket contract;
- если PR обрабатывает входящие WebSocket messages, он не изобретает media acknowledgement DTO до уточнения backend-контракта;
- socket listeners очищаются на unmount;
- нет `any` в production-коде;
- UI не содержит бизнес-логику отправки напрямую;
- empty/loading/error states обработаны;
- disabled/pending state защищает от двойной отправки;
- long username/message не ломает layout;
- touched endpoints/events указаны в PR description;
- если PR обновляет preview последнего сообщения, он также проверяет reorder диалога вверх списка;
- manual smoke описан в PR description.

## 13. Как PM заводит задачи в Jira

Есть два рабочих варианта.

## 13.1 Если команда делает этап на 5 разработчиков без microfrontend

Это рекомендуемый вариант, если на ДЗ10 реально выделены 5 frontend-разработчиков.

### Jira 1 — Messenger UI Shell

Owner: Dev-1
Priority: P0

Включить в описание:

- layout `/messenger` и `/messenger/{userId}`;
- список диалогов;
- поиск;
- mock history;
- `MessageBubble`;
- `MessageComposer` shell;
- slots/props для text/image/voice.

### Jira 2 — Messenger Data + Socket Foundation

Owner: Dev-2
Priority: P0

Граница задачи:

- Dev-2 делает общий data/socket слой.
- Dev-2 не реализует text/image/voice пользовательские сценарии целиком.
- Dev-3/4/5 используют его hooks/functions и соответствующий transport contract.

Включить в описание:

- REST API;
- Socket.IO;
- message types;
- read/unread status;
- socket send contract для text;
- REST mutations для image/voice;
- документированный acknowledgement callback для text и фиксацию media/status backend-blocker;
- preview mapper;
- payload validation;
- cleanup listeners.

Не включать в эту Jira:

- text input UX;
- image picker/preview;
- voice recording/preview;
- отдельные send hooks под каждый тип сообщения с UX-логикой.

### Jira 3 — UC-1 Text Messages

Owner: Dev-3
Priority: P0
Hard dependency: composer/bubble/socket send contracts из Jira 1 + Jira 2
Soft dependency: полный UI/data foundation

Включить в описание:

- text input behavior;
- disabled `Send message` для пустого/whitespace-only текста;
- send text;
- receive text;
- acknowledgement callback для входящего сообщения, если callback приходит от backend;
- pending/error state;
- update dialogue preview;
- reorder диалога вверх списка после нового сообщения;
- вход с профиля через `Send Message`.

### Jira 4 — UC-2 Image Messages

Owner: Dev-4
Priority: P1
Hard dependency: image slot в composer + актуальный `MessageViewModel` + `sendImageMessage` REST mutation
Soft dependency: полный UI/data foundation

Включить в описание:

- image picker;
- validation `1 MB`;
- preview;
- delete preview;
- send image;
- image bubble;
- update preview и reorder диалога вверх списка;
- integration smoke REST response + socket delivery без дублей.

### Jira 5 — UC-3 Voice Messages

Owner: Dev-5
Priority: P1
Hard dependency: voice slot в composer + актуальный `MessageViewModel` + `sendVoiceMessage` REST mutation
Soft dependency: полный UI/data foundation

Включить в описание:

- microphone permission;
- recording;
- limit `1 minute` / `3 MB`;
- preview;
- delete preview;
- send voice;
- voice bubble;
- update preview и reorder диалога вверх списка;
- integration smoke REST response + socket delivery без дублей.

## 13.2 Если команда делает этап на 3 разработчиков без microfrontend

Минимальный понятный вариант:

### Jira 1 — UC-1 Text Messenger

Owner: Dev-1
Priority: P0

Что увидит пользователь:

- Messenger открывается из sidebar.
- Пользователь видит список диалогов и может открыть чат.
- Пользователь может отправить текстовое сообщение.
- Получатель видит сообщение без перезагрузки.
- Диалог с новым сообщением поднимается вверх списка.

Включить в описание:

- страницы `/messenger` и `/messenger/{userId}`;
- список диалогов;
- поиск по username;
- открытие чата из списка;
- открытие чата через `Send Message` на профиле;
- загрузка истории сообщений;
- общий `MessageComposer`;
- общий `MessageBubble`;
- socket send flow для text;
- REST mutations для image/voice;
- Socket.IO connection;
- отправка и получение text message;
- документированный acknowledgement callback для входящих text messages;
- read/unread status;
- update preview и reorder диалога вверх списка;
- точки расширения для image и voice;
- запрет на отдельный composer/socket/message list в задачах Dev-2/Dev-3.

### Jira 2 — UC-2 Image Messages

Owner: Dev-2
Priority: P1
Depends on: Jira 1, общий composer, актуальный `MessageViewModel`, image REST mutation

Что увидит пользователь:

- Пользователь выбирает изображение через иконку картинки.
- Видит preview перед отправкой.
- Может удалить preview.
- Может отправить image-only или image + text.
- Диалог с новым image message поднимается вверх списка.

Включить в описание:

- image picker;
- validation:
  - только image-файлы;
  - максимум `1 MB`;
- image preview;
- delete preview;
- send image-only;
- send image + text;
- multipart `POST /api/v1/messenger/{receiverId}/image`;
- image bubble;
- update preview и reorder диалога вверх списка;
- integration smoke REST response + socket delivery без дублей;
- запрет на отдельный composer/socket.

### Jira 3 — UC-3 Voice Messages

Owner: Dev-3
Priority: P1
Depends on: Jira 1, общий composer, актуальный `MessageViewModel`, voice REST mutation

Что увидит пользователь:

- Пользователь записывает голосовое сообщение через иконку микрофона.
- Может прослушать запись перед отправкой.
- Может удалить запись.
- Отправленное voice-сообщение отображается с play/pause.
- Диалог с новым voice message поднимается вверх списка.

Включить в описание:

- microphone permission;
- recording start/stop;
- limit:
  - `1 minute`;
  - `3 MB`;
- recording indicator;
- voice preview;
- play/pause preview;
- delete preview;
- send voice;
- multipart `POST /api/v1/messenger/{receiverId}/voice`;
- voice bubble with play/pause;
- update preview и reorder диалога вверх списка;
- integration smoke REST response + socket delivery без дублей;
- запрет на отдельный composer/socket.

### Optional Jira 4 — Messenger microfrontend spike

Owner: отдельный разработчик или Tech Lead
Priority: Optional

Заводить только если PM реально хочет проверить microfrontend в этом этапе.

Результат spike:

- можно/нельзя делать сейчас;
- сколько займет setup;
- какие blockers по auth/routing/deploy;
- стоит ли переносить Messenger в отдельный app сейчас или оставить монолит.
