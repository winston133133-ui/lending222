# Структура маршрутов (роутер public/index.php, чистый PHP MVC)

## Публичная часть (лендинг + API)
| Метод | Путь                       | Контроллер@действие            | Назначение |
|-------|----------------------------|--------------------------------|------------|
| GET   | /                          | LandingController@home         | Лендинг (все секции из CMS) |
| GET   | /characters/{slug}         | LandingController@character    | Страница персонажа |
| GET   | /privacy                   | LandingController@legal('privacy')   | Согласие на обработку ПД |
| GET   | /agreement                 | LandingController@legal('agreement') | Пользовательское соглашение |
| POST  | /api/orders                | OrderController@store          | Создание заявки (модалка, шаги) |
| GET   | /api/slots?date=&service_id=| SlotController@available      | Динамические свободные слоты (занятые не возвращаются; 06:00–23:00, буфер ±30 мин) |
| GET   | /api/settings              | PublicSettingsController@all   | Настройки/контакты/условия для JS-виджетов |
| POST  | /api/subscribe             | SubscribeController@store      | Форма подписки (email + согласие ПД) |

## Админ-панель (CRM). Middleware: Auth + Role(admin|manager) + CSRF
| Метод | Путь                                   | Доступ       | Назначение |
|-------|----------------------------------------|--------------|------------|
| GET/POST | /admin/login, /admin/logout         | публично     | Сессии + password_hash/verify |
| GET   | /admin                                 | admin+manager| Дашборд: заявки сегодня/неделя, ближайшие события, выручка (предоплаты/полные), остатки |
| GET   | /admin/orders?view=kanban|table        | admin+manager| Заявки: канбан / таблица |
| GET   | /admin/orders/{id}                     | admin+manager| Карточка заявки (кросс-товары, песни, остаток) |
| POST  | /admin/orders                          | admin+manager| Ручная заявка |
| PATCH | /admin/orders/{id}/status              | admin+manager| Смена статуса (drag&drop канбана) |
| PUT   | /admin/orders/{id}                     | admin+manager| Редактирование (предоплата вручную, сумма) |
| POST  | /admin/orders/{id}/receipt             | admin+manager| Прикрепить чек + отправить на email клиента |
| DELETE| /admin/orders/{id}                     | admin        | Удаление заявки |
| GET   | /api/admin/notifications?since={id}    | admin+manager| Long-polling realtime-уведомлений о новых заявках |
| GET   | /admin/clients, /admin/clients/{id}    | admin+manager| Клиентская база: история заказов, флаг ПД, тел. tel: |
| GET   | /admin/calendar?month=                 | admin        | Календарь бронирований (занятые дата/время, ручные блокировки) |
| CRUD  | /admin/settings/{tab}                  | admin        | 14 вкладок CMS: characters, cross-products, stories, gallery, subscriptions, reviews, texts, contacts, conditions, how-to-order, schedule, notifications, seo, users |
| CRUD  | /admin/users                           | admin        | Пользователи: роли «Администратор»/«Менеджер» |
| POST  | /admin/upload                          | admin        | Загрузка изображений: srcset-варианты (400/800/1600), оптимизация GD |
