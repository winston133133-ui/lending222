<?php
require_once __DIR__ . '/DB.php'; require_once __DIR__ . '/Auth.php'; require_once __DIR__ . '/CSRF.php';
require_once __DIR__ . '/Validator.php'; require_once __DIR__ . '/SlotService.php'; require_once __DIR__ . '/Notifier.php';
/**
 * SiteController — публичная часть (лендинг как на rk4me.ru): hero, карусель персонажей,
 * форма заявки с live-проверкой слотов, отзывы, условия, подписка, контакты + inline-редактор текстов.
 */
class SiteController
{
    /** GET / — главная страница лендинга */
    public function home(): void
    {
        $data = [
            'characters' => DB::all('SELECT c.*, (SELECT path FROM character_images ci WHERE ci.character_id=c.id ORDER BY ci.id LIMIT 1) image
                                    FROM characters c WHERE c.is_active = 1 ORDER BY c.sort_order'),
            'reviews'    => DB::all('SELECT * FROM reviews WHERE is_published = 1 ORDER BY id DESC LIMIT 9'),
            'howto'      => DB::all('SELECT * FROM how_to_order ORDER BY step'),
            'delivery'   => DB::all("SELECT * FROM conditions WHERE group_key='delivery' ORDER BY sort_order"),
            'worktime'   => DB::all("SELECT * FROM conditions WHERE group_key='worktime' ORDER BY sort_order"),
            'payments'   => DB::all('SELECT * FROM payment_methods ORDER BY id'),
            'contacts'   => DB::all('SELECT * FROM contacts ORDER BY sort_order, id'),
            'stories'    => DB::all('SELECT * FROM stories ORDER BY id DESC LIMIT 12'),
            'gallery'    => DB::all('SELECT * FROM gallery ORDER BY id DESC LIMIT 12'),
            'cross'      => DB::all('SELECT * FROM cross_products WHERE is_active=1 ORDER BY id'),
            'sc'         => SlotService::schedule(),
        ];
        http_response_code(200);
        require dirname(__DIR__) . '/Views/site/landing.php';
    }

    /** POST /order/create — приём заявки: серверные валидации + атомарная проверка занятости слота */
    public function storeOrder(): void
    {
        header('Content-Type: application/json; charset=utf-8');
        $in = $_POST;
        $errors = Validator::make($in, [
            'name'=>'required|string|max:150', 'phone'=>'required|phone_ru',
            'event_date'=>'required|date', 'event_time'=>'required|time',
            'pd_consent'=>'boolean_true',
        ]);
        $character = $in['character_id'] ? DB::row('SELECT * FROM characters WHERE id=? AND is_active=1', [(int)$in['character_id']]) : null;
        $service = $in['service_id'] ? DB::row('SELECT * FROM character_services WHERE id=? AND character_id=?', [(int)$in['service_id'], (int)($character['id'] ?? 0)]) : null;
        if (!$errors && !$character) $errors['character_id'] = 'Выберите персонажа';
        // Длительность программы из характеристик — больше забронировать нельзя
        $duration = $service ? max(10, (int)$service['duration_min']) : max(10, (int)($character['duration_min'] ?? 30));
        if (!$errors && strtotime($in['event_date'] . ' ' . $in['event_time']) < time() - 3600)
            $errors['event_date'] = 'Дата не может быть в прошлом';

        $db = DB::pdo();
        try {
            if (!$errors) {
                $db->beginTransaction();
                // SELECT ... FOR UPDATE-аналог: SQLite сериализует запись транзакцией — защита от гонки двух заявок
                $slot = SlotService::isAvailable($in['event_date'], $in['event_time'], $duration);
                if (!$slot['available']) throw new RuntimeException($slot['reason']);
                $phone = Validator::normPhone($in['phone']);
                $cl = DB::row('SELECT id FROM clients WHERE phone=?', [$phone]);
                if ($cl) { $clientId = (int)$cl['id']; DB::run('UPDATE clients SET name=?, pd_consent=1 WHERE id=?', [$in['name'], $clientId]); }
                else { DB::run('INSERT INTO clients (name,phone,pd_consent) VALUES (?,?,1)', [trim($in['name']), $phone]);
                       $clientId = (int)$db->lastInsertId(); }
                $songs = array_slice(array_filter(array_map('trim', [$in['song1'] ?? '', $in['song2'] ?? '', $in['song3'] ?? ''])), 0, 3);
                $price = $service ? (int)$service['price'] : (int)($character['price_from'] ?? 0);
                $prepay = max(0, min((int)round($price * 0.5), $price)); // предоплата 50%
                DB::run("INSERT INTO orders (client_id,character_id,service_id,customer_name,event_date,event_time,address,songs,comment,total_amount,prepayment,status,pd_consent)
                         VALUES (?,?,?,?,?,?,?,?,?,?,?, 'new', 1)",
                    [$clientId, (int)$character['id'], $service ? (int)$service['id'] : null, trim($in['name']),
                     $in['event_date'], $in['event_time'], trim($in['address'] ?? ''), implode('; ', $songs),
                     trim($in['comment'] ?? ''), $price, $prepay]);
                $orderId = (int)$db->lastInsertId();
                // Кросс-товары: цены — только из БД (клиент не может подменить цену)
                foreach ((array)($in['extras'] ?? []) as $pid => $qty) {
                    $prod = DB::row('SELECT * FROM cross_products WHERE id=? AND is_active=1', [(int)$pid]);
                    if ($prod && (int)$qty > 0)
                        DB::run('INSERT INTO order_items (order_id,product_id,product_name,unit_price,qty) VALUES (?,?,?,?,?)',
                            [$orderId, (int)$pid, $prod['name'], (int)$prod['price'], max(1, min(20, (int)$qty))]);
                }
                $db->commit();
                Notifier::queueRealtime('new_order', ['order_id'=>$orderId,'customer_name'=>$in['name'],'event_date'=>$in['event_date'],'event_time'=>$in['event_time']]);
                Notifier::dispatchNewOrder(['id'=>$orderId,'customer_name'=>trim($in['name']),'phone'=>Validator::normPhone($in['phone']),
                    'event_date'=>$in['event_date'],'event_time'=>$in['event_time'],'address'=>trim($in['address'] ?? ''),
                    'character_name'=>$character['name'],'total_amount'=>$price,'prepayment'=>$prepay]);
                echo json_encode(['ok'=>true,'order_id'=>$orderId,'prepay'=>$prepay], JSON_UNESCAPED_UNICODE);
                return;
            }
        } catch (RuntimeException $ex) {
            if ($db->inTransaction()) $db->rollBack();
            http_response_code(422); echo json_encode(['ok'=>false,'errors'=>['event_time'=>$ex->getMessage()]], JSON_UNESCAPED_UNICODE); return;
        }
        http_response_code(422); echo json_encode(['ok'=>false,'errors'=>$errors], JSON_UNESCAPED_UNICODE);
    }

    /** GET /api/slots?date=Y-m-d&character_id=N — свободные слоты для live-подсказок формы */
    public function slots(): void
    {
        header('Content-Type: application/json; charset=utf-8');
        $date = $_GET['date'] ?? ''; $dur = 30;
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) { http_response_code(422); echo json_encode(['error'=>'bad date']); return; }
        if (!empty($_GET['character_id'])) {
            $c = DB::row('SELECT duration_min FROM characters WHERE id=?', [(int)$_GET['character_id']]);
            if ($c) $dur = max(10, (int)$c['duration_min']);
        }
        if (!empty($_GET['service_id'])) {
            $s = DB::row('SELECT duration_min FROM character_services WHERE id=?', [(int)$_GET['service_id']]);
            if ($s) $dur = max(10, (int)$s['duration_min']);
        }
        echo json_encode(['date'=>$date,'duration_min'=>$dur,'slots'=>SlotService::freeSlots($date, $dur)], JSON_UNESCAPED_UNICODE);
    }

    /** POST /subscribe — виджет подписки на обновления (email; журнал подписок попадает в CRM-вкладку «Подписки») */
    public function subscribe(): void
    {
        header('Content-Type: application/json; charset=utf-8');
        // Поддержка JSON-тела (fetch на лендинге) и обычных form-постов
        $in = $_POST;
        if (!isset($in['email']) && str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')) {
            $in = json_decode(file_get_contents('php://input') ?: '', true) ?: [];
        }
        $email = filter_var(trim((string)($in['email'] ?? '')), FILTER_VALIDATE_EMAIL);
        if (!$email) { http_response_code(422); echo json_encode(['ok'=>false,'error'=>'Введите корректный email']); return; }
        if (empty($in['pd_consent'])) { http_response_code(422); echo json_encode(['ok'=>false,'error'=>'Требуется согласие на обработку персональных данных']); return; }
        try { DB::run('INSERT INTO subscriptions (email) VALUES (?)', [$email]); }
        catch (Throwable $e) { echo json_encode(['ok'=>true]); return; } // дубликат — тоже «успех» для пользователя
        echo json_encode(['ok'=>true]);
    }

    /** GET /privacy, /agreement — юридические страницы (тексты редактируются админом) */
    public function legal(string $slug): void
    {
        $page = DB::row('SELECT * FROM legal_pages WHERE slug = ?', [$slug]);
        if (!$page) { http_response_code(404); echo '<h1 style="font-family:system-ui;padding:40px">Страница не найдена</h1>'; return; }
        $canEdit = Auth::check() && Auth::isAdmin();
        http_response_code(200);
        require dirname(__DIR__) . '/Views/site/legal.php';
    }

    /** POST /page/save — сохранение текста юр.страницы (только авторизованный администратор) */
    public function savePage(): void
    {
        CSRF::ensure();
        if (!Auth::check() || !Auth::isAdmin()) { http_response_code(403); exit('Только для администратора'); }
        $slug = preg_replace('/[^a-z_-]/', '', $_POST['slug'] ?? '');
        if (!in_array($slug, ['privacy','agreement'], true)) { http_response_code(422); exit; }
        DB::run('UPDATE legal_pages SET body = ? WHERE slug = ?', [clean_html($_POST['body'] ?? ''), $slug]);
        header('Location: /' . $slug);
    }
}
