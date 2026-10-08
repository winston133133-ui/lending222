-- ============================================================================
-- CRM-система агентства праздников «Ростовые куклы» (Саратов / Энгельс)
-- Схема БД MySQL 5.7+ / MariaDB 10.3+, кодировка utf8mb4
-- Используется install.php и ручным импортом через phpMyAdmin
-- ============================================================================

CREATE DATABASE IF NOT EXISTS party_crm
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE party_crm;

-- ---------------------------------------------------------------------------
-- 1. ПОЛЬЗОВАТЕЛИ CRM (роли: администратор / менеджер)
-- ---------------------------------------------------------------------------
CREATE TABLE users (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100) NOT NULL COMMENT 'Имя пользователя',
    email         VARCHAR(150) NOT NULL COMMENT 'Логин (email)',
    password_hash VARCHAR(255) NOT NULL COMMENT 'password_hash(), bcrypt',
    role          ENUM('admin','manager') NOT NULL DEFAULT 'manager'
                  COMMENT 'admin — полный доступ, manager — только заявки и клиенты',
    is_active     TINYINT(1) NOT NULL DEFAULT 1,
    last_login_at DATETIME NULL,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- 2. КЛИЕНТСКАЯ БАЗА
-- ---------------------------------------------------------------------------
CREATE TABLE clients (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(150) NOT NULL COMMENT 'Имя клиента',
    phone         VARCHAR(20)  NOT NULL COMMENT 'Телефон в формате +7XXXXXXXXXX',
    email         VARCHAR(150) NULL COMMENT 'Для отправки чека по завершении заказа',
    pd_consent    TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Согласие на обработку ПД',
    pd_consent_at DATETIME NULL COMMENT 'Дата и время получения согласия',
    note          TEXT NULL COMMENT 'Заметки менеджера',
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_clients_phone (phone),
    KEY idx_clients_name (name)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- 3. ПЕРСОНАЖИ / ШОУ-ПРОГРАММЫ
-- ---------------------------------------------------------------------------
CREATE TABLE characters (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150) NOT NULL COMMENT 'Название персонажа',
    description     MEDIUMTEXT NULL COMMENT 'Краткое описание для карточки',
    full_content    LONGTEXT NULL COMMENT 'Полное описание (WYSIWYG, HTML с переносами)',
    seo_title       VARCHAR(160) NULL,
    seo_description VARCHAR(300) NULL,
    duration_min    SMALLINT UNSIGNED NOT NULL DEFAULT 30 COMMENT 'Макс. длительность (мин) — ограничение бронирования клиентом',
    base_price      INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Базовая цена (₽)',
    cover_image     VARCHAR(255) NULL COMMENT 'Главное фото (для srcset генерируются размеры)',
    is_active       TINYINT(1) NOT NULL DEFAULT 1,
    sort_order      INT NOT NULL DEFAULT 0,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_characters_active (is_active, sort_order)
) ENGINE=InnoDB;

-- Услуги персонажа: «Открытие магазина — 40 мин — 5000 ₽»
CREATE TABLE character_services (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    character_id INT UNSIGNED NOT NULL,
    name         VARCHAR(150) NOT NULL COMMENT 'Название услуги',
    description  VARCHAR(500) NULL COMMENT 'Описание после наименования услуги',
    duration_min SMALLINT UNSIGNED NOT NULL DEFAULT 30 COMMENT 'Длительность (мин)',
    price        INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Цена (₽)',
    sort_order   INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_cs_character FOREIGN KEY (character_id)
        REFERENCES characters(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Галерея изображений персонажа (несколько фото, лайтбокс на сайте)
CREATE TABLE character_images (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    character_id INT UNSIGNED NOT NULL,
    file_path    VARCHAR(255) NOT NULL,
    thumb_path   VARCHAR(255) NULL COMMENT 'Превью 400px для srcset',
    alt_text     VARCHAR(200) NULL,
    sort_order   INT NOT NULL DEFAULT 0,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ci_character FOREIGN KEY (character_id)
        REFERENCES characters(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Таблица характеристик персонажа («возраст — 3-7 лет», «рост аниматора — 170 см»)
CREATE TABLE character_features (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    character_id INT UNSIGNED NOT NULL,
    label        VARCHAR(100) NOT NULL COMMENT 'Параметр',
    value        VARCHAR(200) NOT NULL COMMENT 'Значение',
    sort_order   INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_cf_character FOREIGN KEY (character_id)
        REFERENCES characters(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- 4. КРОСС-ТОВАРЫ (компактные карточки: фото, наименование, цена)
-- ---------------------------------------------------------------------------
CREATE TABLE cross_products (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    description TEXT NULL,
    price       INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Цена (₽)',
    image_path  VARCHAR(255) NULL,
    thumb_path  VARCHAR(255) NULL,
    is_active   TINYINT(1) NOT NULL DEFAULT 1,
    sort_order  INT NOT NULL DEFAULT 0,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- 5. ЗАЯВКИ
--    Статусы: new → in_work → prepayment → confirmed → completed → cancelled
-- ---------------------------------------------------------------------------
CREATE TABLE orders (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    client_id       INT UNSIGNED NOT NULL COMMENT 'Клиент находится/создаётся по телефону',
    character_id    INT UNSIGNED NULL COMMENT 'Выбранный персонаж/шоу',
    service_id      INT UNSIGNED NULL COMMENT 'Выбранная услуга персонажа',
    event_date      DATE NOT NULL COMMENT 'Дата мероприятия',
    event_time      TIME NOT NULL COMMENT 'Время начала мероприятия',
    duration_min    SMALLINT UNSIGNED NOT NULL DEFAULT 30 COMMENT 'Длительность (не больше характеристики персонажа)',
    address         VARCHAR(300) NOT NULL COMMENT 'Адрес / турбаза / номер беседки',
    songs           JSON NULL COMMENT 'Список песен (до 3-х): ["...","..."]',
    comment         TEXT NULL COMMENT 'Комментарий клиента',
    total_amount    INT NOT NULL DEFAULT 0 COMMENT 'Сумма заказа (₽)',
    prepayment      INT NOT NULL DEFAULT 0 COMMENT 'Предоплата, вносится вручную (₽)',
    -- Остаток НЕ хранится: вычисляется real-time (см. view v_orders_balance)
    status          ENUM('new','in_work','prepayment','confirmed','completed','cancelled')
                    NOT NULL DEFAULT 'new',
    pd_consent      TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Флаг согласия из формы заявки',
    receipt_path    VARCHAR(255) NULL COMMENT 'Прикреплённый чек (статус «Завершено»)',
    receipt_sent_at DATETIME NULL COMMENT 'Чек отправлен на email клиента',
    source          ENUM('site','phone','manual') NOT NULL DEFAULT 'site',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_orders_status (status),
    KEY idx_orders_event_date (event_date, event_time) COMMENT 'Для календаря слотов',
    CONSTRAINT fk_orders_client FOREIGN KEY (client_id)
        REFERENCES clients(id) ON DELETE RESTRICT,
    CONSTRAINT fk_orders_character FOREIGN KEY (character_id)
        REFERENCES characters(id) ON DELETE SET NULL,
    CONSTRAINT fk_orders_service FOREIGN KEY (service_id)
        REFERENCES character_services(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Позиции кросс-товаров внутри заявки (влияют на остаток)
CREATE TABLE order_items (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id     INT UNSIGNED NOT NULL,
    product_id   INT UNSIGNED NULL COMMENT 'NULL — если товар удалён из каталога, снапшот сохранён',
    product_name VARCHAR(150) NOT NULL COMMENT 'Снапшот наименования',
    unit_price   INT UNSIGNED NOT NULL COMMENT 'Снапшот цены на момент добавления',
    quantity     SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    line_total   INT GENERATED ALWAYS AS (unit_price * quantity) STORED,
    CONSTRAINT fk_oi_order FOREIGN KEY (order_id)
        REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_oi_product FOREIGN KEY (product_id)
        REFERENCES cross_products(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Услуги, отмеченные кнопками в заявке (по умолчанию ни одна не отмечена)
CREATE TABLE order_services (
    id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id INT UNSIGNED NOT NULL,
    name     VARCHAR(150) NOT NULL,
    price    INT UNSIGNED NOT NULL DEFAULT 0,
    CONSTRAINT fk_os_order FOREIGN KEY (order_id)
        REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- История смены статусов (воронка продаж)
CREATE TABLE order_status_history (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id    INT UNSIGNED NOT NULL,
    from_status VARCHAR(20) NULL,
    to_status   VARCHAR(20) NOT NULL,
    changed_by  INT UNSIGNED NULL,
    changed_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_osh_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_osh_user  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- 6. КАЛЕНДАРЬ БРОНИРОВАНИЙ
-- ---------------------------------------------------------------------------
CREATE TABLE bookings (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id   INT UNSIGNED NULL COMMENT 'Слот может быть заблокирован вручную без заявки',
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time   TIME NOT NULL COMMENT 'с учётом длительности; буфер ±30 мин применяется при расчёте слотов',
    is_blocked TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Ручная блокировка менеджером',
    reason     VARCHAR(200) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_bookings_date (event_date, start_time),
    CONSTRAINT fk_bookings_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Режим работы и интервалы бронирования (06:00–23:00, шаг и буферы из настроек)
CREATE TABLE work_schedule (
    id            TINYINT UNSIGNED PRIMARY KEY DEFAULT 1,
    open_time     TIME NOT NULL DEFAULT '06:00:00' COMMENT 'Начало бронирования',
    close_time    TIME NOT NULL DEFAULT '23:00:00' COMMENT 'Окончание бронирования',
    slot_interval SMALLINT UNSIGNED NOT NULL DEFAULT 30 COMMENT 'Интервал слотов (мин)',
    buffer_before SMALLINT UNSIGNED NOT NULL DEFAULT 30 COMMENT 'Буфер до мероприятия (мин)',
    buffer_after  SMALLINT UNSIGNED NOT NULL DEFAULT 30 COMMENT 'Буфер после мероприятия (мин)',
    working_days  VARCHAR(20) NOT NULL DEFAULT '1,2,3,4,5,6,7' COMMENT 'Рабочие дни (ISO)',
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- 7. CMS: КОНТЕНТ ПУБЛИЧНОГО САЙТА
-- ---------------------------------------------------------------------------
CREATE TABLE stories (            -- Истории: прямоугольный формат (как Instagram), фото/видео
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    media_type   ENUM('image','video') NOT NULL DEFAULT 'image',
    title        VARCHAR(100) NULL,
    media_path   VARCHAR(255) NOT NULL,
    thumb_path   VARCHAR(255) NULL,
    video_path   VARCHAR(255) NULL,
    view_seconds SMALLINT UNSIGNED NOT NULL DEFAULT 10 COMMENT 'Показ фото N сек (по ТЗ — 10), видео — до конца',
    is_active    TINYINT(1) NOT NULL DEFAULT 1,
    sort_order   INT NOT NULL DEFAULT 0,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE gallery (            -- Галерея: фото с описанием
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(150) NULL,
    description TEXT NULL,
    image_path  VARCHAR(255) NOT NULL,
    thumb_path  VARCHAR(255) NULL,
    is_active   TINYINT(1) NOT NULL DEFAULT 1,
    sort_order  INT NOT NULL DEFAULT 0,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE subscriptions (      -- Подписки: изображение + текст
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(150) NOT NULL,
    description TEXT NULL,
    image_path  VARCHAR(255) NULL,
    thumb_path  VARCHAR(255) NULL,
    link_url    VARCHAR(300) NULL,
    is_active   TINYINT(1) NOT NULL DEFAULT 1,
    sort_order  INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE subscription_leads ( -- Email-подписчики с лендинга
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email      VARCHAR(150) NOT NULL,
    pd_consent TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_sub_email (email)
) ENGINE=InnoDB;

CREATE TABLE reviews (            -- Отзывы: текст, имя, фото (опционально)
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    client_name  VARCHAR(100) NOT NULL,
    text         TEXT NOT NULL,
    rating       TINYINT UNSIGNED NOT NULL DEFAULT 5,
    photo_path   VARCHAR(255) NULL,
    thumb_path   VARCHAR(255) NULL,
    is_published TINYINT(1) NOT NULL DEFAULT 1,
    sort_order   INT NOT NULL DEFAULT 0,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Контакты: единый список (тип «телефон» или «ссылка»), иконка по URL
CREATE TABLE contacts (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    type       ENUM('phone','link') NOT NULL DEFAULT 'link',
    label      VARCHAR(100) NOT NULL COMMENT 'Телефон / WhatsApp / Telegram / Макс',
    value      VARCHAR(300) NOT NULL COMMENT 'tel:+7... или https://...',
    icon_url   VARCHAR(300) NULL COMMENT 'Иконка загружается по внешнему URL',
    sort_order INT NOT NULL DEFAULT 0,
    is_active  TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

-- Условия работы и доставки: структурированные блоки с иконками (не одно поле)
CREATE TABLE conditions (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    group_key  VARCHAR(50) NOT NULL COMMENT 'delivery | worktime | payment_note',
    title      VARCHAR(150) NOT NULL,
    body       TEXT NOT NULL COMMENT 'Полный текст условия',
    icon       VARCHAR(50) NOT NULL DEFAULT 'truck' COMMENT 'SVG-иконка по имени (не эмодзи)',
    sort_order INT NOT NULL DEFAULT 0,
    is_active  TINYINT(1) NOT NULL DEFAULT 1,
    KEY idx_conditions_group (group_key, sort_order)
) ENGINE=InnoDB;

-- Способы оплаты: разделено на виды (карта Сбербанк, безнал для юрлиц)
CREATE TABLE payment_methods (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title      VARCHAR(150) NOT NULL,
    icon       VARCHAR(50) NOT NULL DEFAULT 'card',
    details    TEXT NULL COMMENT 'Реквизиты / email dmitriirusakov-sar@mail.ru',
    note       VARCHAR(500) NULL COMMENT '«Заказ принят только после предоплаты…»',
    sort_order INT NOT NULL DEFAULT 0,
    is_active  TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

-- Как заказать: редактируемые блоки (тексты и иконки)
CREATE TABLE how_to_order (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(150) NOT NULL,
    description TEXT NULL,
    icon        VARCHAR(50) NOT NULL DEFAULT 'star',
    sort_order  INT NOT NULL DEFAULT 0,
    is_active   TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

-- SEO: title/description/keywords для главной и других страниц
CREATE TABLE seo (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    page_key    VARCHAR(50) NOT NULL COMMENT 'home | privacy | agreement | characters',
    title       VARCHAR(160) NULL,
    description VARCHAR(300) NULL,
    keywords    VARCHAR(300) NULL,
    og_image    VARCHAR(255) NULL,
    UNIQUE KEY uq_seo_page (page_key)
) ENGINE=InnoDB;

-- Юридические страницы: согласие на обработку ПД, пользовательское соглашение
CREATE TABLE legal_pages (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug       VARCHAR(50) NOT NULL COMMENT 'privacy | agreement',
    title      VARCHAR(150) NOT NULL,
    content    LONGTEXT NOT NULL COMMENT 'HTML-текст страницы',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_legal_slug (slug)
) ENGINE=InnoDB;

-- Настройки сайта: hero-изображение, логотип, иконка, фон (ключ-значение)
CREATE TABLE site_settings (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    setting_key   VARCHAR(60) NOT NULL COMMENT 'hero_image, logo, favicon, bg_image…',
    setting_value TEXT NULL,
    value_type    ENUM('string','text','json','image','boolean') NOT NULL DEFAULT 'string',
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_settings_key (setting_key)
) ENGINE=InnoDB;

-- Уведомления: Telegram-бот и email о новой заявке
CREATE TABLE notifications (
    id                 TINYINT UNSIGNED PRIMARY KEY DEFAULT 1,
    telegram_enabled   TINYINT(1) NOT NULL DEFAULT 0,
    telegram_bot_token VARCHAR(100) NULL,
    telegram_chat_id   VARCHAR(50) NULL,
    email_enabled      TINYINT(1) NOT NULL DEFAULT 0,
    email_to           VARCHAR(150) NULL COMMENT 'Куда слать уведомления о заявках',
    email_from         VARCHAR(150) NULL,
    updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Лог отправки уведомлений (диагностика и ретраи)
CREATE TABLE notification_log (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    channel    ENUM('telegram','email') NOT NULL,
    event_type VARCHAR(50) NOT NULL DEFAULT 'new_order',
    payload    TEXT NULL,
    status     ENUM('sent','failed') NOT NULL,
    error_msg  VARCHAR(500) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Очередь realtime-уведомлений для админки (long-polling, без перезагрузки)
CREATE TABLE pending_notifications (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id    INT UNSIGNED NULL COMMENT 'NULL — показать всем авторизованным',
    type       VARCHAR(30) NOT NULL DEFAULT 'new_order',
    payload    JSON NOT NULL,
    is_read    TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_pn_unread (is_read, created_at)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- 8. ВЫЧИСЛЯЕМЫЕ ПОЛЯ / ПРЕДСТАВЛЕНИЯ
--    Остаток = сумма заказа − предоплата − сумма кросс-товаров (real-time)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_orders_balance AS
SELECT o.id AS order_id,
       o.total_amount,
       o.prepayment,
       COALESCE(SUM(oi.line_total), 0) AS cross_sum,
       (o.total_amount - o.prepayment - COALESCE(SUM(oi.line_total), 0)) AS balance
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id, o.total_amount, o.prepayment;

-- Выручка для дашборда: предоплаты и полные оплаты по дням
CREATE OR REPLACE VIEW v_revenue AS
SELECT DATE(created_at) AS day,
       SUM(CASE WHEN status IN ('prepayment','confirmed','completed') THEN prepayment ELSE 0 END) AS prepayments,
       SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END) AS completed_sum
FROM orders GROUP BY DATE(created_at);

-- ---------------------------------------------------------------------------
-- 9. НАЧАЛЬНЫЕ ДАННЫЕ (дефолты по ТЗ)
-- ---------------------------------------------------------------------------
INSERT INTO work_schedule (id) VALUES (1)
    ON DUPLICATE KEY UPDATE id = 1;
INSERT INTO notifications (id) VALUES (1)
    ON DUPLICATE KEY UPDATE id = 1;

INSERT INTO site_settings (setting_key, setting_value, value_type) VALUES
 ('site_name', 'Ростовые куклы — Саратов и Энгельс', 'string'),
 ('brand_color', '#800080', 'string'),
 ('hero_title', 'Подарим праздник вашему ребёнку!', 'text'),
 ('hero_subtitle', 'Лучшие ростовые куклы Саратова и Энгельса', 'text'),
 ('footer_disclaimer', 'Сайт носит исключительно информационный характер и не является публичной офертой. Подробная информация о стоимости услуг и товаров, их наличии, видах и характеристиках вы можете узнать в нашем отделе продаж.', 'text')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

INSERT INTO conditions (group_key, title, body, icon, sort_order) VALUES
 ('delivery', 'Доставка ростовой куклы', 'Доставка по Саратову и Энгельсу — бесплатно при заказе от 5000 ₽. За город — 15 ₽/км от границы города. Привозим костюм к нужному времени прямо на площадку праздника.', 'truck', 1),
 ('worktime', 'Время работы ростовой куклы', 'Стандартный блок выступления — 30 минут, затем технический перерыв 15 минут. Бронирование возможно с 06:00 до 23:00.', 'clock', 1),
 ('payment', 'Примечание', 'Заказ считается принятым только после внесения предоплаты и подтверждения менеджером.', 'info', 99);

INSERT INTO payment_methods (title, icon, details, note, sort_order) VALUES
 ('Оплата на карту Сбербанк', 'card', 'Реквизиты карты отправляет менеджер в мессенджер (WhatsApp / Telegram) после согласования заявки.', NULL, 1),
 ('Безналичный расчёт для юр. лиц', 'bank', 'Счёт на оплату запрашивайте по email: dmitriirusakov-sar@mail.ru', 'Заказ считается принятым только после внесения предоплаты и подтверждения менеджером.', 2);

INSERT INTO contacts (type, label, value, icon_url, sort_order) VALUES
 ('phone', 'Телефон', 'tel:+79000000000', NULL, 1),
 ('link', 'WhatsApp', 'https://wa.me/79000000000', 'https://cdn-icons-png.flaticon.com/512/174/174881.png', 2),
 ('link', 'Telegram', 'https://t.me/rostovye_kukli', 'https://cdn-icons-png.flaticon.com/512/2111/2111646.png', 3),
 ('link', 'Макс', 'https://max.ru/', 'https://cdn-icons-png.flaticon.com/512/1006/1006363.png', 4);

INSERT INTO how_to_order (title, description, icon, sort_order) VALUES
 ('Оставьте заявку', 'Заполните форму на сайте — это займёт минуту.', 'edit', 1),
 ('Выберите персонажа', 'Подберём шоу под ваш праздник и свободное время.', 'mask', 2),
 ('Внесите предоплату', '50% — и дата забронирована за вами.', 'card', 3),
 ('Праздник!', 'Кукла приедет точно ко времени.', 'party', 4);

INSERT INTO legal_pages (slug, title, content) VALUES
 ('privacy', 'Согласие на обработку персональных данных', '<h1>Согласие на обработку персональных данных</h1><p>Полный текст…</p>'),
 ('agreement', 'Пользовательское соглашение', '<h1>Пользовательское соглашение</h1><p>Полный текст…</p>');

INSERT INTO seo (page_key, title, description, keywords) VALUES
 ('home', 'Ростовые куклы Саратов и Энгельс — заказать шоу на праздник', 'Аренда ростовых кукол в Саратове и Энгельсе. Заявка онлайн, предоплата 50%, выступление от 30 минут.', 'ростовые куклы, саратов, энгельс, праздник, шоу'),
 ('privacy', 'Согласие на обработку персональных данных', NULL, NULL),
 ('agreement', 'Пользовательское соглашение', NULL, NULL);
