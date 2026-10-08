<?php
require_once __DIR__ . '/DB.php'; require_once __DIR__ . '/Auth.php'; require_once __DIR__ . '/CSRF.php';
require_once __DIR__ . '/Uploader.php'; require_once __DIR__ . '/Validator.php';
/**
 * CMS-модуль: 14 вкладок настроек в строгом порядке ТЗ (без эмодзи в названиях).
 * Каждая вкладка — своя форма; сохранение — единый роут POST /admin/settings/{tab}.
 */
class SettingsController
{
    /** Порядок вкладок админки — строго по ТЗ */
    public const TABS = [
        'characters' => 'Персонажи', 'cross' => 'Кросс-товары', 'stories' => 'Истории', 'gallery' => 'Галерея',
        'subscriptions' => 'Подписки', 'reviews' => 'Отзывы', 'texts' => 'Тексты', 'contacts' => 'Контакты',
        'conditions' => 'Условия и оплата', 'howto' => 'Как заказать', 'schedule' => 'Режим работы',
        'notifications' => 'Уведомления', 'seo' => 'SEO', 'users' => 'Пользователи',
    ];

    public function index(string $tab): void
    {
                if (!isset(self::TABS[$tab])) { http_response_code(404); echo 'Раздел не найден'; return; }
        if (!Auth::isAdmin()) { Auth::requireLogin(); http_response_code(403); echo '<h1 style="font-family:system-ui;padding:40px">Доступ только для администратора</h1>'; return; }
        $data = match ($tab) {
            'characters'    => ['chars' => DB::all('SELECT * FROM characters ORDER BY sort_order,id')],
            'cross'         => ['items' => DB::all('SELECT * FROM cross_products ORDER BY id')],
            'stories'       => ['items' => DB::all('SELECT * FROM stories ORDER BY id')],
            'gallery'       => ['items' => DB::all('SELECT * FROM gallery ORDER BY id')],
            'subscriptions' => ['items' => DB::all('SELECT * FROM subscriptions ORDER BY id DESC LIMIT 200'),
                                'img' => setting('subscribe_image')],
            'reviews'       => ['items' => DB::all('SELECT * FROM reviews ORDER BY id DESC')],
            'texts'         => ['keys' => ['site_name','hero_title','hero_subtitle','hero_image','hero_bg','logo','favicon']],
            'contacts'      => ['items' => DB::all('SELECT * FROM contacts ORDER BY sort_order,id')],
            'conditions'    => ['delivery' => DB::all("SELECT * FROM conditions WHERE group_key='delivery' ORDER BY sort_order"),
                                'worktime' => DB::all("SELECT * FROM conditions WHERE group_key='worktime' ORDER BY sort_order"),
                                'payments' => DB::all('SELECT * FROM payment_methods ORDER BY id')],
            'howto'         => ['items' => DB::all('SELECT * FROM how_to_order ORDER BY step')],
            'schedule'      => ['sc' => DB::row('SELECT * FROM work_schedule ORDER BY id LIMIT 1')],
            'notifications' => [],
            'seo'           => ['pages' => ['home'=>'Главная','characters'=>'Персонажи','privacy'=>'Согласие ПД','agreement'=>'Соглашение'],
                                'legal' => DB::all('SELECT slug,title FROM legal_pages')],
            default         => [],
        };
        admin_render('settings/' . $tab, self::TABS[$tab], 'settings', $data + ['tab' => $tab]);
    }

    /** Единая точка сохранения вкладки */
    public function save(string $tab): void
    {
        CSRF::ensure();
        if (!Auth::isAdmin()) { http_response_code(403); exit('Только для администратора'); }
        match ($tab) {
            'characters'    => $this->saveCharacters(),
            'cross'         => $this->saveSimple('cross_products', ['name','description','price'], 'cross'),
            'stories'       => $this->saveSimple('stories', ['media_url','caption','media_type'], 'story'),
            'gallery'       => $this->saveSimple('gallery', ['image_url','caption'], 'gallery'),
            'reviews'       => $this->saveSimple('reviews', ['name','text','photo_url','rating'], 'review'),
            'contacts'      => $this->saveContacts(),
            'conditions'    => $this->saveConditions(),
            'howto'         => $this->saveHowTo(),
            'texts'         => $this->saveTexts(),
            'schedule'      => $this->saveSchedule(),
            'notifications' => $this->saveNotifications(),
            'seo'           => $this->saveSeo(),
            'subscriptions' => $this->saveSubscribeImg(),
            default         => null,
        };
        header("Location: /admin/settings/$tab");
    }

    /** DELETE-действия внутри вкладок (удаление строки таблицы CMS) */
    public function deleteRow(string $tab, int $id): void
    {
        CSRF::ensure();
        if (!Auth::isAdmin()) { http_response_code(403); exit(); }
        $table = ['characters'=>'characters','cross'=>'cross_products','stories'=>'stories','gallery'=>'gallery',
                  'reviews'=>'reviews','contacts'=>'contacts','conditions'=>'conditions','payments'=>'payment_methods',
                  'howto'=>'how_to_order','services'=>'character_services'][$tab] ?? null;
        if ($table) DB::run("DELETE FROM $table WHERE id = ?", [$id]); // таблица из белого списка — безопасно
        $_SESSION['flash_ok'] = 'Удалено'; header("Location: /admin/settings/" . ($tab === 'services' ? 'characters' : ($tab === 'payments' ? 'conditions' : $tab)));
    }

    // ---------- вкладки ----------
    private function saveCharacters(): void
    {
        $id = (int)($_POST['id'] ?? 0);
        $name = trim($_POST['name'] ?? ''); if ($name === '') return;
        $desc = clean_html($_POST['description'] ?? ''); // WYSIWYG с переносами (<br>) сохраняются
        $fields = [trim($_POST['seo_description'] ?? ''), (int)($_POST['price_from'] ?? 0), (int)($_POST['duration_min'] ?? 30),
                   empty($_POST['is_active']) ? 0 : 1, (int)($_POST['sort_order'] ?? 0)];
        if ($id) DB::run('UPDATE characters SET name=?, slug=?, description=?, seo_description=?, price_from=?, duration_min=?, is_active=?, sort_order=? WHERE id=?',
            array_merge([$name, slugify($name)], $fields, [$id]));
        else DB::run('INSERT INTO characters (name,slug,description,seo_description,price_from,duration_min,is_active,sort_order) VALUES (?,?,?,?,?,?,?,?)',
            array_merge([$name, slugify($name)], $fields));
        if (!$id) $id = (int)DB::pdo()->lastInsertId();
        // Галерея изображений персонажа (несколько фото)
        if (!empty($_FILES['images']['name'][0])) {
            $ins = DB::pdo()->prepare('INSERT INTO character_images (character_id, path, alt) VALUES (?,?,?)');
            foreach ($_FILES['images']['name'] as $k => $n) {
                if ($_FILES['images']['error'][$k]) continue;
                $f = ['name'=>$n,'type'=>$_FILES['images']['type'][$k],'tmp_name'=>$_FILES['images']['tmp_name'][$k],'size'=>$_FILES['images']['size'][$k],'error'=>0];
                try { $ins->execute([$id, Uploader::image($f, 'characters')['path'], $name]); } catch (Throwable $e) {}
            }
        }
        // Таблица характеристик (пары ключ-значение, textarea построчно)
        DB::run('DELETE FROM character_features WHERE character_id = ?', [$id]);
        foreach (array_filter(explode("\n", $_POST['features'] ?? '')) as $line) {
            [$k, $v] = array_pad(explode('=', $line, 2), 2, '');
            if (trim($k)) DB::run('INSERT INTO character_features (character_id, feature_key, feature_value) VALUES (?,?,?)', [$id, trim($k), trim($v)]);
        }
        // Услуги: «название — длительность — цена» (строкой вида title|dur|price)
        if (isset($_POST['services'])) {
            DB::run('DELETE FROM character_services WHERE character_id = ?', [$id]);
            foreach ((array)$_POST['services'] as $s) {
                $t = trim($s['title'] ?? ''); if ($t === '') continue;
                DB::run('INSERT INTO character_services (character_id,title,description,duration_min,price) VALUES (?,?,?,?,?)',
                    [$id, $t, trim($s['description'] ?? ''), max(10,(int)($s['duration_min'] ?? 30)), max(0,(int)($s['price'] ?? 0))]);
            }
        }
        $_SESSION['flash_ok'] = 'Персонаж сохранён';
    }

    /** Дженерик CRUD для простых таблиц (DRY): id=0 -> insert, иначе update; photo — необязательная загрузка */
    private function saveSimple(string $table, array $cols, string $uploadDir): void
    {
        $id = (int)($_POST['id'] ?? 0);
        $vals = []; $ph = [];
        foreach ($cols as $c) { $vals[] = trim((string)($_POST[$c] ?? '')); $ph[] = "$c = ?"; }
        if (!empty($_FILES['photo']['name'])) {
            try { $vals[] = Uploader::image($_FILES['photo'], $uploadDir)['path']; $ph[] = ($table==='stories'?'media_url':'photo_path') . ' = ?'; } catch (Throwable $e) {}
        }
        if ($id) DB::run("UPDATE $table SET " . implode(', ', $ph) . ' WHERE id = ?', array_merge($vals, [$id]));
        else {
            $names = array_map(fn($p) => explode(' =', $p)[0], $ph);
            DB::run("INSERT INTO $table (" . implode(',', $names) . ') VALUES (' . rtrim(str_repeat('?,', count($names)), ',') . ')', $vals);
        }
        $_SESSION['flash_ok'] = 'Сохранено';
    }

    private function saveContacts(): void
    {
        $id = (int)($_POST['id'] ?? 0);
        $type = ($_POST['type'] ?? 'link') === 'phone' ? 'phone' : 'link';
        $value = trim($_POST['value'] ?? ''); $url = trim($_POST['url'] ?? '');
        if ($type === 'phone' && $url === '') { $p = Validator::normPhone($value); if ($p) $url = 'tel:' . $p; }
        $icon = trim($_POST['icon_url'] ?? ''); // иконка — внешний URL (по ТЗ)
        if (!empty($_FILES['icon']['name'])) try { $icon = Uploader::image($_FILES['icon'], 'icons')['path']; } catch (Throwable $e) {}
        $args = [trim($_POST['label'] ?? ''), $type, $url, $value, $icon, (int)($_POST['sort_order'] ?? 0)];
        if ($id) DB::run('UPDATE contacts SET label=?,type=?,url=?,value=?,icon_url=?,sort_order=? WHERE id=?', array_merge($args, [$id]));
        else DB::run('INSERT INTO contacts (label,type,url,value,icon_url,sort_order) VALUES (?,?,?,?,?,?)', $args);
        $_SESSION['flash_ok'] = 'Контакт сохранён';
    }

    private function saveConditions(): void
    {
        $group = in_array($_POST['group'] ?? '', ['delivery','worktime','payment'], true) ? $_POST['group'] : 'delivery';
        $id = (int)($_POST['id'] ?? 0);
        $args = [$group, trim($_POST['title'] ?? ''), clean_html($_POST['body'] ?? ''), trim($_POST['icon'] ?? 'truck'), (int)($_POST['sort_order'] ?? 0)];
        if ($id) DB::run('UPDATE conditions SET group_key=?,title=?,body=?,icon=?,sort_order=? WHERE id=?', array_merge($args, [$id]));
        else DB::run('INSERT INTO conditions (group_key,title,body,icon,sort_order) VALUES (?,?,?,?,?)', $args);
        $_SESSION['flash_ok'] = 'Блок условий сохранён';
    }

    private function saveHowTo(): void
    {
        $id = (int)($_POST['id'] ?? 0);
        $args = [(int)($_POST['step'] ?? 1), trim($_POST['title'] ?? ''), trim($_POST['body'] ?? ''), trim($_POST['icon'] ?? 'form')];
        if ($id) DB::run('UPDATE how_to_order SET step=?,title=?,body=?,icon=? WHERE id=?', array_merge($args, [$id]));
        else DB::run('INSERT INTO how_to_order (step,title,body,icon) VALUES (?,?,?,?)', $args);
        $_SESSION['flash_ok'] = 'Шаг сохранён';
    }

    /** Вкладка «Тексты»: hero-изображение, логотип, иконка сайта + текстовые настройки */
    private function saveTexts(): void
    {
        foreach (['site_name','hero_title','hero_subtitle'] as $k)
            if (isset($_POST[$k])) DB::run('INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', [$k, trim($_POST[$k])]);
        foreach (['hero_image','hero_bg','logo','favicon'] as $k) {
            if (!empty($_FILES[$k]['name'])) {
                try { DB::run('INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', [$k, Uploader::image($_FILES[$k], 'branding')['path']]); } catch (Throwable $e) {}
            } elseif (isset($_POST[$k])) DB::run('INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', [$k, trim($_POST[$k])]);
        }
        $_SESSION['flash_ok'] = 'Тексты и изображения сохранены';
    }

    private function saveSchedule(): void
    {
        $errors = Validator::make($_POST, ['start_time'=>'required|time','end_time'=>'required|time','interval_min'=>'required|int|min:10','buffer_min'=>'required|int|min:0']);
        if ($errors) { $_SESSION['flash_error'] = 'Проверьте формат времени (ЧЧ:ММ)'; return; }
        DB::run('UPDATE work_schedule SET start_time=?, end_time=?, interval_min=?, buffer_min=? WHERE id=?',
            [$_POST['start_time'], $_POST['end_time'], max(10,(int)$_POST['interval_min']), max(0,(int)$_POST['buffer_min']), (int)($_POST['id'] ?? 1)]);
        $_SESSION['flash_ok'] = 'Режим работы обновлён';
    }

    private function saveNotifications(): void
    {
        foreach (['tg_bot_token','tg_chat_id','notify_email'] as $k)
            DB::run('INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', [$k, trim($_POST[$k] ?? '')]);
        $_SESSION['flash_ok'] = 'Настройки уведомлений сохранены';
    }

    private function saveSeo(): void
    {
        foreach (['title','description','keywords'] as $f)
            DB::run('INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', ["seo_$f", trim($_POST[$f] ?? '')]);
        $_SESSION['flash_ok'] = 'SEO сохранён';
    }

    private function saveSubscribeImg(): void
    {
        if (!empty($_FILES['image']['name'])) {
            try { DB::run("INSERT INTO settings (key,value) VALUES ('subscribe_image',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", [Uploader::image($_FILES['image'], 'subscribe')['path']]); } catch (Throwable $e) {}
        }
        $del = (int)($_POST['delete_sub'] ?? 0);
        if ($del) DB::run('DELETE FROM subscriptions WHERE id = ?', [$del]);
        $_SESSION['flash_ok'] = 'Сохранено';
    }
}
